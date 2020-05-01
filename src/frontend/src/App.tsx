import React from "react";
import {
  Container,
  Grid,
  Header,
  Image,
  Sidebar,
  Menu,
  Segment,
  Button,
  ButtonGroup,
  Step,
  Icon,
  Embed,
  List,
  Divider,
} from "semantic-ui-react";
import poomLogo from "./poom_logo.png";
import videoPlaceholder from "./video-placeholder.jpg";

import Draggable from "react-draggable"; // The default

export default function FixedMenuLayout() {
  return (
    <>
      <Menu fixed="top" borderless inverted>
        <Menu.Item header>
          <Image size="mini" src={poomLogo} style={{ marginRight: "0.5em" }} />
          Poom
        </Menu.Item>
      </Menu>
      <Container fluid text style={{ marginTop: "12vh" }}>
        <Header as="h1">Poom is a free video conferencing app.</Header>
        <Header as="h3">
          It uses a novel P2P protocol so your conversation never passes through
          our servers.
        </Header>
        <p>The name is a portmanteau of 💩 and Zoom</p>
        <Container style={{ marginBottom: "2.5em" }} />
        <Button size="massive">
          <Icon name="phone" />
          Start Call
        </Button>
      </Container>
      <Menu fixed="bottom" inverted icon="labeled" widths={6}>
        {/* <Container> */}
        <Menu.Item name="microphone">
          <Icon name="microphone" />
          Unmute
        </Menu.Item>
        <Menu.Item name="video">
          <Icon name="video" />
          Start video
        </Menu.Item>
        <Menu.Item name="desktop">
          <Icon name="desktop" />
          Share Screen
        </Menu.Item>
        {/* </Container> */}
      </Menu>
    </>
  );
}

function DraggableControls() {
  return (
    <Draggable>
      <Step.Group fluid stackable="tablet">
        <Step active>
          {/* <ButtonGroup> */}
          <Button size="tiny" icon="microphone" />
          <Button size="tiny" icon="video" />
          {/* <Button  icon="desktop" /> */}
          {/* </ButtonGroup> */}
        </Step>
        <Step active>
          <Button size="huge">
            <Icon name="phone" />
            Start Call
          </Button>
        </Step>
      </Step.Group>
    </Draggable>
  );
}

function SideBySideVideos() {
  return (
    <Grid columns={2} divided>
      <Grid.Row>
        <Grid.Column>
          <Draggable>
            <Embed
              autoplay={false}
              brandedUI
              color="white"
              hd={false}
              id="D0WnZyxp_Wo"
              iframe={{
                allowFullScreen: true,
                style: {
                  padding: 10,
                },
              }}
              placeholder={videoPlaceholder}
              source="youtube"
            />
          </Draggable>{" "}
        </Grid.Column>
        <Grid.Column>
          <Draggable>
            <Embed
              autoplay={false}
              brandedUI
              color="white"
              hd={false}
              id="D0WnZyxp_Wo"
              iframe={{
                allowFullScreen: true,
                style: {
                  padding: 10,
                },
              }}
              placeholder={videoPlaceholder}
              source="youtube"
            />
          </Draggable>{" "}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

function FooterCandidates() {
  return (
    <>
      <Menu
        fixed="bottom"
        style={{
          minHeight: "8vh",
          maxHeight: "8vh",
          boxSizing: "border-box",
        }}
        inverted
        borderless
        widths="1"
      >
        <Menu.Item header>
          <Image size="mini" src={poomLogo} />
        </Menu.Item>
      </Menu>
      <Segment
        inverted
        vertical
        style={{
          minHeight: "30vh",
          maxHeight: "30vh",
          boxSizing: "border-box",
        }}
      >
        <Container textAlign="center">
          <Image centered size="mini" src={poomLogo} />
          <List horizontal inverted divided link size="small">
            <List.Item as="a" href="#">
              Site Map
            </List.Item>
            <List.Item as="a" href="#">
              Contact Us
            </List.Item>
            <List.Item as="a" href="#">
              Terms and Conditions
            </List.Item>
            <List.Item as="a" href="#">
              Privacy Policy
            </List.Item>
          </List>
        </Container>
      </Segment>
    </>
  );
}
