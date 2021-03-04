import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  TextField,
  Theme
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import LiveTitle from "./LiveEdit/LiveTitle";
import BaseSelect from "./Base/BaseSelect";
import HOCLive from "./HOC/HOC";
// import { useLive } from "../hooks/useLive";
import {
  subscribeToEvent,
  subscribeWithRoom,
  dispatchWithRoom,
  createSocket
} from "../api";
import config from "../config";
import axios from "axios";
import ReactTooltip from "react-tooltip";
import { useLocalStorage } from "../hooks/useLocalStorage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    marginForField: {
      marginBottom: theme.spacing(3)
    }
  })
);

const EditableForm = (props: {
  params: { roomId: string };
  history: any;
  account: any;
}) => {
  const classes = useStyles();

  // const { subscribeToGlobalState, dispatchGlobalState } = useLive("root");
  // const live = {
  //   subscribe: subscribeToGlobalState,
  //   dispatch: dispatchGlobalState
  // };

  // const [accountId, setAccountId] = useLocalStorage("accountId", 0);
  const [accountId, setAccountId] = props.account;

  // const roomId = useRef(props.params.roomId);
  const { roomId } = props.params;

  const [submitted, setSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(submitted || !accountId);

  console.log("entering to form", roomId);
  // const [roomId, setRoomId] = useState(props.params.roomId || "");
  // const [socketRef, setSocket] = useState(createSocket(props.params.roomId));
  // const live = useRef({
  //   subscribe: (cb: any) => cb,
  //   dispatch: (st: any) => st
  // });

  const buildLive = (socketRef: any, roomId: string) => ({
    subscribe: subscribeWithRoom(socketRef, roomId),
    dispatch: dispatchWithRoom(socketRef, roomId)
  });

  // const [live, setLive] = useState(buildLive(socketRef, roomId));
  let socketRef = useRef<any>(null),
    live: { subscribe: any; dispatch: any } | null = null;

  if (roomId) {
    if (!socketRef.current) socketRef.current = createSocket(roomId);
    live = buildLive(socketRef.current, roomId);
    console.log("live here is", live, socketRef);

    live.subscribe(
      (_: any, state: { submitted: boolean }) =>
        "submitted" in state && setSubmitted(state.submitted)
    );

    subscribeToEvent(
      socketRef.current,
      "documentNotFound"
    )(() => {
      alert(
        `This room (${roomId}) doesn't exist, we are creating a new room for you`
      );
      props.history.replace({ pathname: `/` });
    });
  }

  useEffect(() => {
    const getRoomId = async () => {
      const response = await axios.get(config.SERVER_URL);
      console.log("response", response.data.roomId);
      // setRoomId(response.data.roomId);
      console.log("now room is", roomId);
      props.history.replace({ pathname: `/${response.data.roomId}` });
    };
    // console.log(roomId.current.roomId)

    // socketRef.disconnect();
    // socketRef.current = createSocket(roomId.current);

    if (!roomId) getRoomId();
  }, [roomId]);

  useEffect(() => console.log("account", accountId), [accountId]);

  useEffect(() => setPreviewMode(submitted || !accountId), [
    submitted,
    accountId
  ]);

  // useEffect(() => {
  //   // setSocket(createSocket(roomId));
  //   // socketRef.current = createSocket(roomId);
  //   props.history.replace({ pathname: `/${roomId}` });
  //   console.log("now room is", roomId);
  // }, [roomId]);

  // useEffect(() => {
  //   console.log("ref updated", roomId, socketRef.current);
  //   setLive(buildLive(socketRef.current, roomId));
  // }, [socketRef.current]);

  // const Description = HOCLive(
  //   (props) => <TextField multiline label="Description" {...props} />,
  //   "description"
  // );

  const handleSubmit = async () => {
    try {
      await axios.get(`${config.SERVER_URL}${roomId}/submit`, {
        headers: {
          "x-access-token": accountId
        }
      });

      setSubmitted(true);

      live?.dispatch({ submitted: true });
    } catch (error) {
      if (error.response.status !== 200) {
        alert(error.response.data.message);
        return;
      }
    }
  };

  return (
    <div>
      {live && (
        <div>
          <h3>
            {submitted
              ? "You can review submitted doc"
              : accountId
              ? "Create a new document"
              : "Login to edit"}
          </h3>
          <form noValidate autoComplete="off">
            <fieldset style={{ border: "0 none" }} disabled={!accountId}>
              <Grid
                className={classes.marginForField}
                item
                xs={12}
                data-tip="tip"
              >
                <LiveTitle live={live} disabled={previewMode} />
              </Grid>
              {/* <ReactTooltip place="right" type="dark" effect="solid" /> */}

              <Grid className={classes.marginForField} item xs={12}>
                <HOCLive
                  live={live}
                  component={BaseSelect}
                  stateKey="select"
                  disabled={previewMode}
                />
              </Grid>

              <Grid className={classes.marginForField} item xs={12}>
                <HOCLive
                  live={live}
                  component={TextField}
                  stateKey="date"
                  id="date"
                  label="Date"
                  type="date"
                  // defaultValue="2017-05-24"
                  InputLabelProps={{
                    shrink: true
                  }}
                  disabled={previewMode}
                />
              </Grid>

              <Grid className={classes.marginForField} item xs={12}>
                <HOCLive
                  live={live}
                  component={TextField}
                  stateKey="description"
                  multiline
                  label="Description"
                  disabled={previewMode}
                />
              </Grid>
              {!previewMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              ) : null}
            </fieldset>
          </form>
        </div>
      )}
      {!live && <h3>Generating a room for you...</h3>}
    </div>
  );
};

export default EditableForm;
