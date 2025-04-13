import React, { useState, useEffect } from "react";

function App() {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("");

  const startJob = async () => {
    const res = await fetch("http://localhost:8080/api/start-job", {
      method: "GET",
    });
    const data = await res.json();
    console.log(data);
    setJobId(data.jobId);
    setStatus("");
  };

  useEffect(() => {
    if (!jobId) return;
    console.log("React: Creating EventSource with jobId:", jobId);
    const source = new EventSource(
      `http://localhost:8080/api/events?jobId=${jobId}`
    );

    source.addEventListener("job-update", (e) => {
      console.log("React: Event received - raw data:", e.data); // Log the raw data
      try {
        const parsedData = JSON.parse(e.data);
        setStatus(parsedData.status);
        if (parsedData.status === "completed") {
          source.close();
        }
      } catch (error) {
        console.error(
          "React: Error parsing event data:",
          error,
          "Raw data:",
          e.data
        );
        // Handle the error, e.g., set an error state
        setStatus("error");
      }
    });

    source.onerror = (error) => {
      console.error("React: EventSource error:", error);
      source.close();
    };

    return () => {
      console.log("React: Closing EventSource for jobId:", jobId);
      source.close();
    };
  }, [jobId]);

  return (
    <div style={{ padding: 30 }}>
      <h1>Job Status Tracker</h1>
      <button onClick={startJob}>Start Job</button>
      {jobId && <p>Job ID: {jobId}</p>}
      {status && <p>Status: {status}</p>}
    </div>
  );
}

export default App;
