import { View } from 'react-native';

import { styles } from './styles';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  const percentage = Math.round((current / total) * 100);

  const widthAnimated = useSharedValue(percentage)

  const stylesAnimated = useAnimatedStyle(() => {
    return ({
      width: `${widthAnimated.value}%`
    })
  })

  useEffect(() => {
    widthAnimated.value = withTiming(percentage, { duration: 1000 })
  }, [current])

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, stylesAnimated]} />
    </View>
  );
}