import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Canvas, Rect, BlurMask } from '@shopify/react-native-skia'
import { THEME } from '../../styles/theme';


const STATUS = ['transparent', THEME.COLORS.BRAND_LIGHT, THEME.COLORS.DANGER_LIGHT]


type Props = {
    status: number
}

const OverlayFeedback: React.FC<Props> = ({ status }) => {
    const color = STATUS[status]
    const { width, height } = useWindowDimensions()
    const opacity = useSharedValue(0)


    useEffect(() => {
        opacity.value = withSequence(withTiming(1, { duration: 400, easing: Easing.bounce }), withTiming(0))
    }, [status])


    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value
        }
    })
    return (
        <Animated.View style={[animatedStyle, { width, height, position: 'absolute' }]}>
            <Canvas style={{ flex: 1 }}>
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    color={color}
                >
                    <BlurMask blur={50} />
                </Rect>
            </Canvas>
        </Animated.View>
    )
}

export default OverlayFeedback;