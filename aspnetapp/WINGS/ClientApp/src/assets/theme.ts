import { createTheme } from '@mui/material/styles';
import { blueGrey, pink, cyan, purple, grey, red } from "@mui/material/colors";

export const theme = createTheme({
  palette: {
    primary: blueGrey,
    secondary: pink,
    background: {
      paper: grey[800]
    },
    success: {
      main: cyan["A200"],
      dark: "#008AF2",
      contrastText: "#52ff33"
    },
    error: {
      main: red["A400"]
    },
    info: {
      main: purple["A100"]
    },
  },
  typography: {
    button: {
      textTransform: "none"
    }
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: "#fff",
            '& fieldset': {
              borderColor: grey[700],
            },
            '&:hover fieldset': {
              borderColor: grey[50],
            }
          }
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: "#fff",
            '& fieldset': {
              borderColor: grey[700],
            },
            '&:hover fieldset': {
              borderColor: grey[50],
            }
          }
        }
      }
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'none !important',
          backgroundColor: grey[800],
          color: '#fff'
        },
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: '80%'
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: grey[800],
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: grey[600],
          },
          '&.Mui-selected:hover': {
            backgroundColor: grey[600],
          },
          '&:hover': {
            backgroundColor: grey[700],
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: grey[400]
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: grey[400],
          '&.Mui-checked': {
            color: red["A400"]
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: grey[400],
          '&.Mui-checked': {
            color: red["A400"]
          }
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: blueGrey[500],
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        stickyHeader: {
          backgroundColor: blueGrey[500],
        },
        root: {
          borderBottom: "1px solid",
          borderBottomColor: grey[700],
          color: "#fff",
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)"
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            backgroundColor: red["A400"]
          }
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        subheader: {
          color: grey[400]
        }
      }
    },
    MuiButton: {
      styleOverrides:
      {
        root: {
          "&.Mui-disabled": {
            color: grey[700],
            borderColor: grey[800]
          },
        }
      }
    }
  }
});
