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
      main: '#13428f'
    },
    secondaryPiggy: {
      main: '#ffbce6'
    },
    primary: {
      light: '#5dc2fc',
      main: '#13428f', 
      dark: '#5dc2fc',
      piggy: '#fc5dbf'
    },
    primaryPiggy: {
      main: '#fc5dbf',
      active: '#5dc2fc'
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
    },
    MuiButton: {
      styleOverrides: { 
        contained: {
          backgroundColor: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f',
          "&:hover": {
            backgroundColor: cookies.get('colorScheme')==='piggy' ? '#620140' : '#5dc2fc'
          }
        },
        outlined: {
          borderColor: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f',
          color: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f',
          "&:hover": {
            borderColor: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f'
          }
        },
        text: {
          border: '1px solid #b10000',
          color: '#b10000',
          "&:hover": {
            backgroundColor: '#b100008e'
          },
          "&:disabled": {
            border: 'none',
            backgroundColor: '#0000001f'
          }
        }
    }
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: {
          backgroundColor: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
            color: cookies.get('colorScheme')==='piggy' ? '#fc5dbf' : '#13428f'
        }
      }
    }
  }
});

export default defaultTheme;