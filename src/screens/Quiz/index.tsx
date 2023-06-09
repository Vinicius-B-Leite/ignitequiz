import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';

import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ProgressBar } from '../../components/ProgressBar';
import { THEME } from '../../styles/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import OverlayFeedback from '../../components/OverlayFeedback';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];


const CARD_INCLINATION = 10
const CARD_SKIP_AREA = (-200)

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const shake = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const cardPosition = useSharedValue(0)


  const [statusReply, setStatusReply] = useState<0 | 1 | 2>(0)

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setPoints(prevState => prevState + 1);
      setStatusReply(1)
      handleNextQuestion()
    } else {
      shakeAnimation()
      setStatusReply(2)
    }

    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  const shakeAnimation = () => {
    shake.value = withSequence(
      withTiming(3),
      withTiming(0, undefined, (fineshed) => {
        'worklet'
        if (fineshed){
          runOnJS(handleNextQuestion)()
        }
      })
    )
  }

  const shakeStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate(
          shake.value,
          [0, 0.5, 1, 1.5, 2, 2.5, 3],
          [0, -15, 0, 15, 0, -15, 0]
        )
      }]
    }
  })

  const scrollHandle = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    }
  })

  const fixedProgressBar = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      zIndex: 1,
      left: '-5%',
      opacity: interpolate(
        scrollY.value,
        [50, 90],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [50, 100],
            [-40, 0],
            Extrapolate.CLAMP
          )
        }
      ]
    }
  })

  const onPan = Gesture
    .Pan()
    .activateAfterLongPress(200)
    .onUpdate((event) => {
      const isMovingToLeft = event.translationX < 0
      if (isMovingToLeft) {
        cardPosition.value = event.translationX
      }
    })
    .onEnd((event) => {
      if (event.translationX <= CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)()
      }
      cardPosition.value = withTiming(0)
    })

  const dragStyles = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION
    return {
      transform: [
        { translateX: cardPosition.value },
        { rotateZ: `${rotateZ}deg` }
      ]
    }
  })
  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);


  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <OverlayFeedback status={statusReply} />
      <Animated.View style={fixedProgressBar}>
        <Text style={styles.title}>{quiz.title}</Text>
        <ProgressBar total={quiz.questions.length} current={currentQuestion + 1} />
      </Animated.View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandle}
        scrollEventThrottle={16}
      >
        <QuizHeader
          title={quiz.title}
          currentQuestion={currentQuestion + 1}
          totalOfQuestions={quiz.questions.length}
        />
        <GestureDetector gesture={onPan}>
          <Animated.View style={[shakeStyleAnimated, dragStyles]}>
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
              onUnMount={() => setStatusReply(0)}
            />
          </Animated.View>
        </GestureDetector>
        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}