import { createTheme } from '@mui/material/styles';
import Cookies from 'universal-cookie';


const cookies = new Cookies();


const defaultTheme = createTheme({
  palette: {
    mode: cookies.get('colorScheme')==='dark' ? 'dark' : 'light',
    headers: {
      main: '#000000',
      piggy: '#620140'
    },
    regularText: {
      main: 'darkGray',
      piggy: '#303030'
    },
    inputText: {
      main: '#000000',
      piggy: '#000000'
    },
    formsBckgr: {
      main: '#ffffff',
      piggy: '#ffe6f0'
    },
    mainBckgr: {
      main: '#e7e7e7',
      dark: '#7f7f7f',
      piggy: '#ecb7d0'
    },
    error: {
      main: '#b10000',
    },
    secondary: {
      main: '#13428f',
      piggy: '#ffbce6'
    },
    primary: {
      light: '#5dc2fc',
      main: '#13428f', 
      dark: '#5dc2fc',
      piggy: '#fc5dbf'
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
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: cookies.get('colorScheme')==='dark' ? '#131313' : (cookies.get('colorScheme')==='piggy' ? '#ffe6f0' : 'white') } },
    }
  }
});

export default defaultTheme;