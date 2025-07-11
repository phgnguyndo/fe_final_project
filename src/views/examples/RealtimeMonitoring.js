import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Alert,
  CardTitle,
} from "reactstrap";
import { Line, Bar } from "react-chartjs-2";
import { chartOptions } from "variables/charts.js";
import io from "socket.io-client";

const RealtimeMonitoring = () => {
  const [realtimeData, setRealtimeData] = useState({
    flow_pkts_s: 0,
    flow_byts_s: 0,
    tot_fwd_pkts: 0,
    tot_bwd_pkts: 0,
    max_mse: 0,
    abnormal_percentage: 0,
    mse_values: [],
    flow_pkts_s_history: [],
    flow_byts_s_history: [],
    attack_history: [],
  });
  const [alertData, setAlertData] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://192.168.11.132:5000");

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Connected to WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("realtime_data", (data) => {
      setRealtimeData({
        flow_pkts_s: data.flow_pkts_s || 0,
        flow_byts_s: data.flow_byts_s || 0,
        tot_fwd_pkts: data.tot_fwd_pkts || 0,
        tot_bwd_pkts: data.tot_bwd_pkts || 0,
        max_mse: data.max_mse || 0,
        abnormal_percentage: data.abnormal_percentage || 0,
        mse_values: data.mse_values || [],
        flow_pkts_s_history: data.flow_pkts_s_history || [],
        flow_byts_s_history: data.flow_byts_s_history || [],
        attack_history: data.attack_history || [],
      });
      if (!data.is_anomaly) {
        setAlertData(null);
      }
    });

    socket.on("alert", (data) => {
      setAlertData(data);
      setTimeout(() => {
        setAlertData((current) => (current === data ? null : current));
      }, 30000);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Disconnected from WebSocket server");
      setAlertData(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Dữ liệu cho biểu đồ Line (mse_values) với đường ngưỡng
  const mseChartData = {
    labels: realtimeData.mse_values?.map((_, index) => `Point ${index + 1}`) || [],
    datasets: [
      {
        label: "MSE Values",
        data: realtimeData.mse_values || [],
        fill: false,
        borderColor: "#5e72e4",
        borderWidth: 2,
        tension: 0.6,
        pointRadius: 0,
      },
      {
        label: "Threshold",
        data: Array(realtimeData.mse_values?.length).fill(0.5),
        fill: false,
        borderColor: "#ff0000",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  // Dữ liệu cho biểu đồ Bar (flow_pkts_s và flow_byts_s history)
  const trafficChartData = {
    labels: realtimeData.flow_pkts_s_history?.map((_, index) => `T${index + 1}`) || [],
    datasets: [
      {
        label: "Packets/s",
        data: realtimeData.flow_pkts_s_history || [],
        backgroundColor: "#2dce89",
        borderColor: "#2dce89",
        borderWidth: 1,
      },
      {
        label: "Bytes/s",
        data: realtimeData.flow_byts_s_history || [],
        backgroundColor: "#f5365c",
        borderColor: "#f5365c",
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Realtime Network Monitoring</h3>
              </CardHeader>
              <CardBody>
                {socketConnected ? (
                  <>
                    {/* Hiển thị các thông số chính */}
                    <Row className="mb-4">
                      <Col xl="3">
                        <Card className="card-stats">
                          <CardBody>
                            <Row>
                              <div className="col">
                                <CardTitle
                                  tag="h5"
                                  className="text-uppercase text-muted mb-0"
                                >
                                  Packets/s
                                </CardTitle>
                                <span className="h2 font-weight-bold mb-0">
                                  {realtimeData.flow_pkts_s?.toFixed(2) || 0}
                                </span>
                              </div>
                              <Col className="col-auto">
                                <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                                  <i className="fas fa-tachometer-alt" />
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xl="3">
                        <Card className="card-stats">
                          <CardBody>
                            <Row>
                              <div className="col">
                                <CardTitle
                                  tag="h5"
                                  className="text-uppercase text-muted mb-0"
                                >
                                  Bytes/s
                                </CardTitle>
                                <span className="h2 font-weight-bold mb-0">
                                  {realtimeData.flow_byts_s?.toFixed(2) || 0}
                                </span>
                              </div>
                              <Col className="col-auto">
                                <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                                  <i className="fas fa-chart-line" />
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xl="3">
                        <Card className="card-stats">
                          <CardBody>
                            <Row>
                              <div className="col">
                                <CardTitle
                                  tag="h5"
                                  className="text-uppercase text-muted mb-0"
                                >
                                  Fwd Packets
                                </CardTitle>
                                <span className="h2 font-weight-bold mb-0">
                                  {realtimeData.tot_fwd_pkts || 0}
                                </span>
                              </div>
                              <Col className="col-auto">
                                <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                  <i className="fas fa-arrow-up" />
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xl="3">
                        <Card className="card-stats">
                          <CardBody>
                            <Row>
                              <div className="col">
                                <CardTitle
                                  tag="h5"
                                  className="text-uppercase text-muted mb-0"
                                >
                                  Bwd Packets
                                </CardTitle>
                                <span className="h2 font-weight-bold mb-0">
                                  {realtimeData.tot_bwd_pkts || 0}
                                </span>
                              </div>
                              <Col className="col-auto">
                                <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                  <i className="fas fa-arrow-down" />
                                </div>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                    {/* Biểu đồ luôn hiển thị */}
                    <Row className="mb-4">
                      <Col xl="6">
                        <Card className="bg-gradient-default shadow">
                          <CardHeader className="bg-transparent">
                            <h2 className="text-white mb-0">MSE Values</h2>
                          </CardHeader>
                          <CardBody>
                            <div className="chart">
                              <Line
                                data={mseChartData}
                                options={{
                                  ...chartOptions,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      suggestedMax:
                                        Math.max(...(realtimeData.mse_values || [0])) * 1.2 || 0.02,
                                      title: {
                                        display: true,
                                        text: "MSE Value",
                                        color: "#fff",
                                      },
                                      ticks: {
                                        callback: function (value) {
                                          return value < 10 ? value?.toFixed(6) : value;
                                        },
                                      },
                                    },
                                    x: {
                                      title: {
                                        display: true,
                                        text: "Data Points",
                                        color: "#fff",
                                      },
                                    },
                                  },
                                  plugins: {
                                    legend: {
                                      labels: {
                                        color: "#fff",
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xl="6">
                        <Card className="shadow">
                          <CardHeader className="bg-transparent">
                            <h2 className="mb-0">Traffic History</h2>
                          </CardHeader>
                          <CardBody>
                            <div className="chart">
                              <Bar
                                data={trafficChartData}
                                options={{
                                  ...chartOptions,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                    },
                                  },
                                  plugins: {
                                    legend: {
                                      labels: {
                                        color: "#333",
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                    {/* Phần cảnh báo */}
                    <Col xl="12">
                      {alertData ? (
                        <Alert color="danger" className="mt-4">
                          <h4>Alert: Attack Detected!</h4>
                          <p><strong>Timestamp:</strong> {alertData.timestamp || "N/A"}</p>
                          <p><strong>Prediction:</strong> {alertData.prediction || "Unknown"}</p>
                          <p><strong>Max MSE:</strong> {(alertData.max_mse || 0).toFixed(6)}</p>
                          <p>
                            <strong>Abnormal Percentage:</strong>{" "}
                            {(alertData.abnormal_percentage || 0).toFixed(2)}%
                          </p>
                          <p>
                            <strong>Duration Confirmed:</strong>{" "}
                            {alertData.duration_confirmed || 0} seconds
                          </p>
                          <p><strong>Details:</strong> {alertData.details || "No additional details"}</p>
                        </Alert>
                      ) : (
                        <Alert color="success" className="mt-4">
                          <h4>Status: Normal</h4>
                          <p>No anomalies detected in the network traffic.</p>
                          <p>
                            <strong>Current MSE:</strong> {(realtimeData.max_mse || 0).toFixed(6)}
                          </p>
                          <p>
                            <strong>Abnormal Percentage:</strong>{" "}
                            {(realtimeData.abnormal_percentage || 0).toFixed(2)}%
                          </p>
                        </Alert>
                      )}
                    </Col>
                    {/* Phần lịch sử tấn công */}
                    <Col xl="12" className="mt-4">
                      <Card className="shadow">
                        <CardHeader className="border-0">
                          <h3 className="mb-0">Attack History</h3>
                        </CardHeader>
                        <CardBody>
                          {realtimeData.attack_history.length > 0 ? (
                            <ul className="list-unstyled">
                              {realtimeData.attack_history.map((attack, index) => (
                                <li key={index} className="mb-2">
                                  <strong>{attack.timestamp}</strong>: {attack.prediction} 
                                  (MSE: {(attack.max_mse || 0).toFixed(6)}, 
                                  Abnormal: {(attack.abnormal_percentage || 0).toFixed(2)}%, 
                                  Duration: {attack.duration_confirmed || 0}s)
                                  <br />
                                  <small>{attack.details}</small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No attacks detected yet.</p>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  </>
                ) : (
                  <Alert color="warning" className="mt-4 text-center">
                    Connecting to WebSocket server...
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RealtimeMonitoring;