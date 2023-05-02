import { createMuiTheme } from '@material-ui/core/styles';
import { blueGrey, pink, cyan, purple } from "@material-ui/core/colors";

export const theme = createMuiTheme({
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
    type: "dark"
  },
  typography: {
    button: {
      textTransform: "none"
    }
  },
  props: {
    MuiTextField: {
      variant: "outlined"
    },
    MuiTable: {
      size: "small",
    }
  },
  overrides: {
    MuiPaper: {
      root: {
        transition: 'none !important'
      },
    },
    MuiTableHead: {
      root: {
        backgroundColor: blueGrey[500]
      }
    },
    MuiTableCell: {
      stickyHeader: {
        backgroundColor: blueGrey[500]
      }
    }
  }
});
