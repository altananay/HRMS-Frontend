import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";


let data = [

];


const Charts = ({deparments}) => {

  data = deparments
  return (
    <>
      <body className="g-sidenav-show">
        <div className="min-height-300 position-absolute w-100"></div>
        <main className="main-content position-relative border-radius-lg">
          <div className="container-fluid py-4">
            <div className="row">
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
                        <Tooltip label="Çalışan sayısı" />
                        <Legend />
                        <Bar dataKey="numberOfEmployees" name="Çalışan sayısı" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-sm-6 mb-xl-0 mb-4">
         
              </div>
            </div>
          </div>
        </main>
      </body>
    </>
  );
};

export default Charts;
