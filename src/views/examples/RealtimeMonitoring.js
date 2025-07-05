/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// reactstrap components
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Alert,
  CardTitle, // Thêm dòng này
} from "reactstrap";
// react plugin for charts
import { Line, Bar } from "react-chartjs-2";
// chart options
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
  });
  const [alertData, setAlertData] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Kết nối WebSocket (thay 'http://localhost:5000' bằng URL backend của bạn)
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Connected to WebSocket server");
    });

    socket.on("realtime_data", (data) => {
      setRealtimeData({
        flow_pkts_s: data.flow_pkts_s,
        flow_byts_s: data.flow_byts_s,
        tot_fwd_pkts: data.tot_fwd_pkts,
        tot_bwd_pkts: data.tot_bwd_pkts,
        max_mse: data.max_mse,
        abnormal_percentage: data.abnormal_percentage,
        mse_values: data.mse_values,
        flow_pkts_s_history: data.flow_pkts_s_history,
        flow_byts_s_history: data.flow_byts_s_history,
      });
    });

    socket.on("alert", (data) => {
      setAlertData(data);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      console.log("Disconnected from WebSocket server");
    });

    // Cleanup khi component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Dữ liệu cho biểu đồ Line (mse_values)
  const mseChartData = {
    labels: realtimeData.mse_values.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: "MSE Values",
        data: realtimeData.mse_values,
        fill: false,
        borderColor: "#5e72e4",
        borderWidth: 2,
        tension: 0.6, // Tạo đường cong mượt mà
        pointRadius: 0, // Loại bỏ các chấm
      },
    ],
  };

  // Dữ liệu cho biểu đồ Bar (flow_pkts_s và flow_byts_s history)
  const trafficChartData = {
    labels: realtimeData.flow_pkts_s_history.map((_, index) => `T${index + 1}`),
    datasets: [
      {
        label: "Packets/s",
        data: realtimeData.flow_pkts_s_history,
        backgroundColor: "#2dce89",
        borderColor: "#2dce89",
        borderWidth: 1,
      },
      {
        label: "Bytes/s",
        data: realtimeData.flow_byts_s_history,
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
                                  {realtimeData.flow_pkts_s.toFixed(2)}
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
                                  {realtimeData.flow_byts_s.toFixed(2)}
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
                                  {realtimeData.tot_fwd_pkts}
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
                                  {realtimeData.tot_bwd_pkts}
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
                                      suggestedMax: Math.max(...(realtimeData.mse_values || [0])) * 1.2,
                                      title: {
                                        display: true,
                                        text: "MSE Value",
                                        color: "#fff",
                                      },
                                      ticks: {
                                        callback: function (value) {
                                          return value < 10 ? value.toFixed(6) : value;
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
                    {alertData && (
                      <Col xl="12">
                        <Alert color="danger" className="mt-4">
                          <h4>Alert: Attack Detected!</h4>
                          <p><strong>Timestamp:</strong> {alertData.timestamp}</p>
                          <p><strong>Prediction:</strong> {alertData.prediction}</p>
                          <p><strong>Max MSE:</strong> {alertData.max_mse.toFixed(6)}</p>
                          <p><strong>Abnormal Percentage:</strong> {alertData.abnormal_percentage.toFixed(2)}%</p>
                          <p><strong>Duration Confirmed:</strong> {alertData.duration_confirmed} seconds</p>
                        </Alert>
                      </Col>
                    )}
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