import { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { HouseLine, Trash } from 'phosphor-react-native';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';
import Animated, { Layout, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([]);
  const refs = useRef<Swipeable[]>([])
  const { goBack } = useNavigation();

  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string, index: number) {
    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        {
          text: 'Não',
          onPress: () => refs.current[index].close()
        }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

     
      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item, index) => (
            <Animated.View
              entering={SlideInRight}
              exiting={SlideOutRight}
              layout={Layout.springify()}
              key={item.id}>

              <Swipeable
                ref={ref => ref && refs.current.push(ref)}
                overshootLeft={false}
                containerStyle={styles.swipeableContainer}
                renderRightActions={() => null}
                renderLeftActions={() => (
                  <Pressable onPress={() => handleRemove(item.id, index)} style={styles.deleteHistory}><Trash size={23} color='#fff' /></Pressable>
                )}>
                <HistoryCard data={item} />
              </Swipeable>
            </Animated.View>
          ))
        }
      </ScrollView>
    </View>
  );
}