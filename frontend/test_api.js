const http = require("http");

async function testApi() {
  const newSim = {
    id: "test-sim-1",
    title: "Test Simulation",
    description: "Testing API",
    status: "approved"
  };

  console.log("POSTing new simulation...");
  const postRes = await fetch("http://localhost:3000/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSim)
  });
  console.log("POST response:", postRes.status, await postRes.text());

  console.log("GETting simulations...");
  const getRes = await fetch("http://localhost:3000/api/submissions");
  const data = await getRes.json();
  const found = data.simulations.find(s => s.id === "test-sim-1");
  console.log("Found in GET:", !!found);
}

setTimeout(testApi, 3000); // wait for server to start
