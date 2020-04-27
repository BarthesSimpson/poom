import React, { useState, useCallback, useEffect, useRef } from "react";
import feathers from "@feathersjs/client";
import io from "socket.io-client";
import AppShell from "@airbnb/lunar-app-shell";
import AdaptiveGrid from "@airbnb/lunar/lib/components/AdaptiveGrid";
import Grid from "@airbnb/lunar/lib/components/Grid";
import { Col } from "@airbnb/lunar/lib/components/Grid";
import LayoutShell from "@airbnb/lunar-layouts/lib/components/LayoutShell";
import Layout from "@airbnb/lunar-layouts/lib/components/Layout";
import Title from "@airbnb/lunar/lib/components/Title";
import Spacing from "@airbnb/lunar/lib/components/Spacing";
import IconButton from "@airbnb/lunar/lib/components/IconButton";
import Button from "@airbnb/lunar/lib/components/Button";
import ButtonGroup from "@airbnb/lunar/lib/components/ButtonGroup";
import Divider from "@airbnb/lunar/lib/components/Divider";
import Smile from "@airbnb/lunar-icons/lib/general/IconSmile";
import CallIn from "@airbnb/lunar-icons/lib/general/IconCallIn";
// import Phone from "@airbnb/lunar-icons/lib/general/IconPhone";
// import Camera from "@airbnb/lunar-icons/lib/general/IconCamera";
import Audio from "@airbnb/lunar-icons/lib/interface/IconAudio";
import Video from "@airbnb/lunar-icons/lib/interface/IconVideo";
import Laptop from "@airbnb/lunar-icons/lib/general/IconLaptop";
let backendHost = "http://localhost:3030";
let frontendHost = "http://localhost:1234";

const socket = io(backendHost);
const app = feathers();

function parseUrl() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const chatId = params.get("chatId");
  return { chatId };
}

export default function () {
  return (
    <AppShell name="Poom">
      <LayoutShell>
        <Layout>
          <Header />
          <Divider />

          <AdaptiveGrid
            defaultItemsPerRow={1}
            breakpoints={{
              "800": 2,
            }}
          >
            <Title level={2}>Yo homie</Title>
            <Title level={2}>Drive slow homie</Title>
          </AdaptiveGrid>
        </Layout>
      </LayoutShell>
    </AppShell>
  );
}

function Header() {
  return (
    <AdaptiveGrid
      noGutter
      defaultItemsPerRow={1}
      breakpoints={{
        "400": 1,
        "600": 2,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", flexBasis: "100" }}>
        <Spacing inline top={1} right={2}>
          <Title level={1} inline centerAlign={false}>
            p<Smile inline={true} />
            <Smile inline={true} />m
          </Title>
        </Spacing>
        <Spacing inline top={2}>
          <Title level={3} inline>
            A portmanteau of 💩 and Zoom
          </Title>
        </Spacing>
      </div>
      <Controls />
    </AdaptiveGrid>
  );
}

function Controls() {
  return (
    <ButtonGroup endAlign stretched>
      <IconButton>
        <CallIn size="3em" />
      </IconButton>
      <IconButton>
        <Video size="3em" />
      </IconButton>
      <IconButton>
        <Laptop size="3em" />
      </IconButton>
    </ButtonGroup>
  );
}
// function Header() {
//   return (
//     <Grid endAlign>
//       <Col span={8}>
//         <Title level={1} inline>
//           p<Smile inline={true} />
//           <Smile inline={true} />m
//         </Title>
//         <Spacing left={2} inline>
//           <Title level={3} inline>
//             A portmanteau of 💩 and Zoom
//           </Title>
//         </Spacing>
//       </Col>
//       <Col span={4}>
//         <Controls />
//       </Col>
//     </Grid>
//   );
// }
