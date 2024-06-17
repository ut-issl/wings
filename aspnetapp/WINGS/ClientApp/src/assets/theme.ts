import { createTheme } from '@mui/material/styles';
import { blueGrey, pink, cyan, purple } from "@mui/material/colors";

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
  // props: {
  //   MuiTextField: {
  //     variant: "outlined"
  //   },
  //   MuiTable: {
  //     size: "small",
  //   }
  // },
  // overrides: {
  //   MuiPaper: {
  //     root: {
  //       transition: 'none !important'
  //     },
  //   },
  //   MuiTableHead: {
  //     root: {
  //       backgroundColor: blueGrey[500]
  //     }
  //   },
  //   MuiTableCell: {
  //     stickyHeader: {
  //       backgroundColor: blueGrey[500]
  //     }
  //   }
  // }
});
