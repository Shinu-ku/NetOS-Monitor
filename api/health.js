export const access = "public";
export const methods = ["GET"];
export default async function (req, res) {
  res.json({
    name: "NetOS Monitor",
    status: "prototype",
    mode: "demo-data",
    liveAgentsConnected: false,
    message: "Dashboard API is online. Endpoint agent ingestion and authenticated response commands are not enabled yet."
  });
}