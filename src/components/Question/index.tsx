import { Dimensions, Text } from 'react-native';

import { Option } from '../Option';
import { styles } from './styles';
import Animated, { Keyframe, runOnJS } from 'react-native-reanimated';

type QuestionProps = {
  title: string;
  alternatives: string[];
}

type Props = {
  question: QuestionProps;
  alternativeSelected?: number | null;
  setAlternativeSelected?: (value: number) => void;
  onUnMount: () => void
}

const SCREEN_WIDTH = Dimensions.get('screen').width
export function Question({ question, alternativeSelected, setAlternativeSelected, onUnMount }: Props) {

  const enteringAnimation = new Keyframe({
    0: {
      transform: [
        { translateX: SCREEN_WIDTH },
        { rotate: '90deg' }
      ]
    },
    100: {
      transform: [
        { translateX: 0 },
        { rotate: '0deg' }
      ],
    }
  })
  const exitingAnimation = new Keyframe({
    0: {
      transform: [
        { translateX: 0 },
        { rotate: '0deg' }
      ]
    },
    100: {
      transform: [
        { translateX: -SCREEN_WIDTH },
        { rotate: '-90deg' }
      ],
    }
  })

  return (
    <Animated.View
      style={styles.container}
      entering={enteringAnimation.duration(300)}
      exiting={exitingAnimation.duration(300).withCallback((fineshed) =>{
        'worklet'
        if (fineshed){
          runOnJS(onUnMount)()
        }
      })}>
      <Text style={styles.title}>
        {question.title}
      </Text>

      {
        question.alternatives.map((alternative, index) => (
          <Option
            key={index}
            title={alternative}
            checked={alternativeSelected === index}
            onPress={() => setAlternativeSelected && setAlternativeSelected(index)}
          />
        ))
      }
    </Animated.View>
  );
}