import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
} from "recharts";

import { Link } from "react-router-dom";

import BarChartIcon from "@mui/icons-material/BarChart";
import Navbar from "../public/Navbar";
import Sidebar from "./layouts/Sidebar";
import Loader from "react-loaders";

const data = [
  { name: "1. Sınıf", Toplam: 5 },
  { name: "2. Sınıf", Toplam: 6 },
  { name: "3. Sınıf", Toplam: 7 },
  { name: "4. Sınıf", Toplam: 8 },
  { name: "5. Sınıf", Toplam: 9 },
  { name: "6. Sınıf", Toplam: 10 },
  { name: "7. Sınıf", Toplam: 11 },
  { name: "8. Sınıf", Toplam: 12 },
  { name: "Lise", Toplam: 13 },
  { name: "Yetişkin", Toplam: 14 },
];

const data01 = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
  { name: "Group E", value: 278 },
  { name: "Group F", value: 189 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Charts = () => {
  return (
    <>
      <body className="g-sidenav-show">
        <Loader type="pacman" active></Loader>
        <div className="min-height-300 position-absolute w-100"></div>
        <Sidebar></Sidebar>
        <main className="main-content position-relative border-radius-lg">
          <div className="container-fluid py-4">
            <div className="row" style={{ marginTop: "100px" }}>
              <div className="col-xl-6 col-sm-6 mb-xl-0 mb-4">
                <div style={{ width: "500px", height: "300px" }}>
                  <div style={{ width: "100%", height: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Toplam" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-sm-6 mb-xl-0 mb-4">
                <div style={{ width: "500px", height: "300px" }}>
                  <div style={{ width: "100%", height: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart width={400} height={400}>
                        <Pie
                          dataKey="value"
                          isAnimationActive={false}
                          data={data01}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        />

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </body>
    </>
  );
};

export default Charts;
