import { StyleSheet } from 'react-native';

import { THEME } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.GREY_800,
  },
  history: {
    flexGrow: 1,
    padding: 32,
  },
  swipeableContainer: {
    height: 90,
    width: '100%',
    borderRadius: 6,
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
  },
  deleteHistory: {
    height: 90,
    width: 90,
    borderRadius: 6,
    backgroundColor: THEME.COLORS.DANGER_LIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  }
});