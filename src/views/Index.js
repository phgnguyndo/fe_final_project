import { useState, useEffect } from "react";
import classnames from "classnames";
import { Line, Bar } from "react-chartjs-2";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  Alert,
  CardTitle,
} from "reactstrap";
import io from "socket.io-client";
import Header from "components/Headers/Header.js";

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
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

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

  const chartExample1 = {
    data1: {
      labels: (realtimeData.mse_values?.slice(-30) || []).map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: "MSE Values",
          data: realtimeData.mse_values?.slice(-30) || [],
          fill: false,
          borderColor: "#ff0000",
          borderWidth: 2,
          tension: 0.6,
          pointRadius: 0,
        },
        {
          label: "Threshold",
          data: Array(Math.min(realtimeData.mse_values?.length || 0, 30)).fill(0.011),
          fill: false,
          borderColor: "#5e72e4",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
        },
      ],
    },
    data2: {
      labels: (realtimeData.mse_values?.slice(-7) || []).map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: "MSE Values",
          data: realtimeData.mse_values?.slice(-7) || [],
          fill: false,
          borderColor: "#ff0000",
          borderWidth: 2,
          tension: 0.6,
          pointRadius: 0,
        },
        {
          label: "Threshold",
          data: Array(Math.min(realtimeData.mse_values?.length || 0, 7)).fill(0.011),
          fill: false,
          borderColor: "#5e72e4",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax:
            Math.max(...(realtimeData.mse_values?.slice(-30) || [0])) * 1.2 || 0.02,
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
    },
  };

  const chartExample2 = {
    data: {
      labels: (realtimeData.flow_pkts_s_history?.slice(-15) || []).map((_, index) => `T${index + 1}`),
      datasets: [
        {
          label: "Packets/s",
          data: realtimeData.flow_pkts_s_history?.slice(-15) || [],
          backgroundColor: "#2dce89",
          borderColor: "#2dce89",
          borderWidth: 1,
        },
        {
          label: "Bytes/s",
          data: realtimeData.flow_byts_s_history?.slice(-15) || [],
          backgroundColor: "#f5365c",
          borderColor: "#f5365c",
          borderWidth: 1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "#333",
          },
        },
      },
    },
  };

  return (
    <>
      <Header
        stats={[
          {
            title: "Packets/s",
            value: realtimeData.flow_pkts_s?.toFixed(2) || 0,
            icon: "fas fa-tachometer-alt",
            bgClass: "bg-success",
          },
          {
            title: "Bytes/s",
            value: realtimeData.flow_byts_s?.toFixed(2) || 0,
            icon: "fas fa-chart-line",
            bgClass: "bg-info",
          },
          {
            title: "Fwd Packets",
            value: realtimeData.tot_fwd_pkts || 0,
            icon: "fas fa-arrow-up",
            bgClass: "bg-warning",
          },
          {
            title: "Bwd Packets",
            value: realtimeData.tot_bwd_pkts || 0,
            icon: "fas fa-arrow-down",
            bgClass: "bg-danger",
          },
        ]}
      />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      MSE Overview
                    </h6>
                    <h2 className="text-white mb-0">MSE Value</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 1,
                          })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 1)}
                        >
                          <span className="d-none d-md-block">All Points</span>
                          <span className="d-md-none">A</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 2,
                          })}
                          data-toggle="tab"
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 2)}
                        >
                          <span className="d-none d-md-block">Last 7 Points</span>
                          <span className="d-md-none">7</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ maxHeight: "250px", overflow: "hidden" }}>
                  <Line
                    data={chartExample1[chartExample1Data]}
                    options={chartExample1.options}
                    getDatasetAtEvent={(e) => console.log(e)}
                    height={250}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Performance
                    </h6>
                    <h2 className="mb-0">Traffic History</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ maxHeight: "250px", overflow: "hidden" }}>
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                    height={250}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Page visits</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Page name</th>
                    <th scope="col">Visitors</th>
                    <th scope="col">Unique users</th>
                    <th scope="col">Bounce rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">/argon/</th>
                    <td>4,569</td>
                    <td>340</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/index.html</th>
                    <td>3,985</td>
                    <td>319</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/charts.html</th>
                    <td>3,513</td>
                    <td>294</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      36,49%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/tables.html</th>
                    <td>2,050</td>
                    <td>147</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 50,87%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/profile.html</th>
                    <td>1,795</td>
                    <td>190</td>
                    <td>
                      <i className="fas fa-arrow-down text-danger mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Social traffic</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Referral</th>
                    <th scope="col">Visitors</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>1,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">60%</span>
                        <div>
                          <Progress
                            max="100"
                            value="60"
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>5,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">70%</span>
                        <div>
                          <Progress
                            max="100"
                            value="70"
                            barClassName="bg-gradient-success"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Google</th>
                    <td>4,807</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">80%</span>
                        <div>
                          <Progress max="100" value="80" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Instagram</th>
                    <td>3,678</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">75%</span>
                        <div>
                          <Progress
                            max="100"
                            value="75"
                            barClassName="bg-gradient-info"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">twitter</th>
                    <td>2,645</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">30%</span>
                        <div>
                          <Progress
                            max="100"
                            value="30"
                            barClassName="bg-gradient-warning"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5">
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
          <Col xl="12">
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
        </Row>
      </Container>
    </>
  );
};

export default RealtimeMonitoring;