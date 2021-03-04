import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Toolbar,
  Typography
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import config from "../config";
import axios from "axios";
import React from "react";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(1)
  },
  title: {
    flexGrow: 1
  }
}));

export default function MyAppBar(props: { account: any }) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // const [accountId, setAccountId] = useLocalStorage("accountId", 0);
  const [accountId, setAccountId] = props.account;

  const handleAuth = async () => {
    if (accountId) {
      // alert('You already logged in')
      setAccountId(0);
      return;
    }

    try {
      const response = await axios.post(`${config.SERVER_URL}auth`, {
        login,
        password
      });

      setAccountId(response.data.id);
    } catch (error) {
      if (error.response.status !== 200) {
        alert(error.response.data.message);
        return;
      }
    } finally {
      handleClose();
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Container fixed>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              className={classes.menuButton}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Live editing!
            </Typography>
            <Box mr={3}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={accountId ? handleAuth : handleClickOpen}
              >
                Log {accountId ? "out" : "in"}
              </Button>

              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
              >
                <DialogTitle id="form-dialog-title">Log in</DialogTitle>
                <DialogContent>
                  <DialogContentText>Authorize to live edit!</DialogContentText>

                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Login"
                    type="text"
                    onChange={(e) => setLogin(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleAuth} color="primary">
                    Log in
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}
