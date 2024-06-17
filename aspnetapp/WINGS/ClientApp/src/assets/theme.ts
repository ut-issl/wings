import { createTheme } from '@mui/material/styles';
import { blueGrey, pink, cyan, purple, grey } from "@mui/material/colors";

export const theme = createTheme({
  palette: {
    primary: blueGrey,
    secondary: pink,
    success: {
      main: cyan["A200"],
      dark: "#008AF2",
      contrastText: "#52ff33"
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
          transition: 'none !important'
        },
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
          borderBottom: "0px",
          color: "#fff"
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)"
        }
      }
    }
  }
});
