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
import {
  subscribeToEventWithRoom,
  subscribeWithRoom,
  dispatchWithRoom,
  createSocket
} from "../api";
import config from "../config";
import axios from "axios";
import MyTooltip from "./MyTooltip";

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

  const [accountId, setAccountId] = props.account;

  const { roomId } = props.params;

  const [submitted, setSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(submitted || !accountId);

  // console.log("Entering to the room", roomId);

  const buildLive = (socketRef: any, roomId: string) => ({
    subscribe: subscribeWithRoom(socketRef, roomId),
    dispatch: dispatchWithRoom(socketRef, roomId, accountId)
  });

  let eventHandler: Function = () => {};

  let socketRef = useRef<any>(null),
    live: { subscribe: any; dispatch: any } | null = null;

  if (roomId) {
    if (!socketRef.current) socketRef.current = createSocket(roomId);
    live = buildLive(socketRef.current, roomId);

    live.subscribe(
      (_: any, state: { submitted: boolean }) =>
        "submitted" in state && setSubmitted(state.submitted)
    );

    subscribeToEventWithRoom(
      socketRef.current,
      "documentNotFound",
      roomId
    )(() => {
      alert(
        `This room (${roomId}) doesn't exist, we are creating a new room for you`
      );
      props.history.replace({ pathname: `/` });
    });

    eventHandler = subscribeToEventWithRoom(
      socketRef.current,
      "documentEdited",
      roomId
    );
  }

  useEffect(() => {
    const getRoomId = async () => {
      const response = await axios.get(config.SERVER_URL as string);

      props.history.replace({ pathname: `/${response.data.roomId}` });
    };

    if (!roomId) getRoomId();
  }, [roomId]);

  useEffect(() => console.log("account", accountId), [accountId]);

  useEffect(() => setPreviewMode(submitted || !accountId), [
    submitted,
    accountId
  ]);

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
              <MyTooltip eventHandler={eventHandler} triggerKey="title">
                <Grid className={classes.marginForField} item xs={12}>
                  <LiveTitle live={live} disabled={previewMode} />
                </Grid>
              </MyTooltip>

              <MyTooltip eventHandler={eventHandler} triggerKey="select">
                <Grid className={classes.marginForField} item xs={12}>
                  <HOCLive
                    live={live}
                    component={BaseSelect}
                    stateKey="select"
                    disabled={previewMode}
                  />
                </Grid>
              </MyTooltip>

              <MyTooltip eventHandler={eventHandler} triggerKey="date">
                <Grid className={classes.marginForField} item xs={12}>
                  <HOCLive
                    live={live}
                    component={TextField}
                    stateKey="date"
                    id="date"
                    label="Date"
                    type="date"
                    InputLabelProps={{
                      shrink: true
                    }}
                    disabled={previewMode}
                  />
                </Grid>
              </MyTooltip>

              <MyTooltip eventHandler={eventHandler} triggerKey="description">
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
              </MyTooltip>
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
