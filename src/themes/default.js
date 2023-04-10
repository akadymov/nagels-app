import { createTheme } from '@mui/material/styles';
import configFile from '../config.json';
import Cookies from 'universal-cookie';


const cookies = new Cookies();


const defaultTheme = createTheme({
  palette: {
    mode: cookies.get('colorScheme')==='dark' ? 'dark' : 'light',
    headers: {
      main: '#000000',
    },
    regularText: {
      main: 'darkGray',
    },
    inputText: {
      main: '#000000',
    },
    formsBckgr: {
      main: '#ffffff',
    },
    mainBckgr: {
      main: '#e7e7e7',
      dark: '#7f7f7f'
    },
    error: {
      main: '#b10000',
    },
    secondary: {
      main: '#13428f',
    },
    primary: {
      light: '#5dc2fc',
      main: '#13428f', 
      dark: '#5dc2fc',
    },
    blackSuit: {
      main: '#000000',
    },
    contrastControlElements: {
      main: '#ffffff',
    },
    contrastControlPanel: {
      main: '#000000',
    },
    disabled: {
      main: '#808080',
    },
    transparentElementBckgr: {
      main: 'hsl(0, 0%, 0%, 0.7)',
    },
    succeedText: {
      main: '#008000',
    },
    totalRow: {
      main: '#6b6b6b',
      dark: ''
    },
    borderColor: {
      main: '#000000',
      light: '#808080',
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  }
});

export default defaultTheme;