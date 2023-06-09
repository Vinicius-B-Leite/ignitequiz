import { Pressable, PressableProps, Text, View } from 'react-native';

import { THEME } from '../../styles/theme';
import { styles } from './styles';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolateColor, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

const TYPE_COLORS = {
  EASY: THEME.COLORS.BRAND_LIGHT,
  HARD: THEME.COLORS.DANGER_LIGHT,
  MEDIUM: THEME.COLORS.WARNING_LIGHT,
}

type Props = PressableProps & {
  title: string;
  isChecked?: boolean;
  type?: keyof typeof TYPE_COLORS;
}



const PressableAnimated = Animated.createAnimatedComponent(Pressable)


export function Level({ title, type = 'EASY', isChecked = false, ...rest }: Props) {
  const scale = useSharedValue(1)
  const checked = useSharedValue(1)
  const COLOR = TYPE_COLORS[type]

  const stylesContainerAnimated = useAnimatedStyle(() => {
    return ({
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(checked.value, [0, 1], ['transparent', COLOR])
    })
  })
  const stylesTextAnimated = useAnimatedStyle(() => {
    return ({
      color: interpolateColor(checked.value, [0, 1], [COLOR, THEME.COLORS.GREY_100])
    })
  })


  const onPressIn = () => {
    scale.value = withTiming(1.2)
  }
  const onPressOut = () => {
    scale.value = withTiming(1)
  }

  useEffect(() => {
    checked.value = withTiming(isChecked ? 1 : 0)
  }, [isChecked])
  return (
    <PressableAnimated
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.container, stylesContainerAnimated, { borderColor: COLOR }]}
      {...rest}>
      <Animated.Text style={
        [
          styles.title,
          stylesTextAnimated,

        ]}>
        {title}
      </Animated.Text>
    </PressableAnimated>
  );
}