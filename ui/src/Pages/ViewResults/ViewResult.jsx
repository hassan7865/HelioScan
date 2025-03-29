import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ViewResult.css";
import Request, { BaseURL } from "../../../Utils/Request";
import Footer from "../../Components/Footer/Footer";
import Navbar from "../../Components/Navbar/Navbar";
import UserProfile from "../../../Utils/UserProfile";

const ViewResult = () => {
  const [scanResults, setScanResults] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [latestScanDate, setLatestScanDate] = useState("");
  const [tumorRate, setTumorRate] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
    const token = UserProfile.GetUserData().access_token;
      await Request(`/user/viewResults?page=${page}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          setScanResults(res.data.scan_results);
          setTotalItems(res.data.total_items);
          setLatestScanDate(res.data.latest_scan_date);
          setTumorRate(res.data.tumor_rate);
          setTotalPages(Math.ceil(res.data.total_items / ITEMS_PER_PAGE));
        })
        .catch((error) => {
          console.error("Error fetching scan results:", error);
        });
    };

    fetchData();
  }, [page]);

  return (
    <>
      <Navbar></Navbar>
      <main>
        <section className="results-section">
          <h2 className="animate-text">Scan Results</h2>

          <div className="stats-container animate-fade-in">
            <div className="stat-card">
              <i className="fas fa-file-medical fa-3x"></i>
              <h3>Total Scans</h3>
              <p>{totalItems}</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-calendar-check fa-3x"></i>
              <h3>Latest Scan</h3>
              <p>{latestScanDate}</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-chart-pie fa-3x"></i>
              <h3>Tumor Rate</h3>
              <p>{tumorRate}%</p>
            </div>
          </div>

          <div className="table-container animate-fade-in">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image Details</th>
                  <th>Date</th>
                  <th>Prediction</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.length > 0 ? (
                  scanResults.map((result) => (
                    <tr key={result.id}>
                      <td>{result.id}</td>
                      <td>
                        <div
                          className="image-preview"
                          style={{
                            backgroundImage: `url(${BaseURL+"/"+result.image_path})`,
                          }}
                        ></div>
                        <a target="_blank" href={BaseURL+"/"+result.image_path} >{BaseURL+"/"+result.image_path}</a>
                      </td>
                      <td>{result.date_created}</td>
                      <td
                        className={`prediction ${
                          result.prediction === "Tumor" ? "tumor" : "normal"
                        }`}
                      >
                        <span
                          className={`badge badge-${result.prediction.toLowerCase()}`}
                        >
                          {result.prediction}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${result.scan_status.toLowerCase()}`}
                        >
                          {result.scan_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No results found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination animate-fade-in">
            {page > 1 && (
              <button
                className="btn-secondary"
                onClick={() => setPage(page - 1)}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
            )}
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            {totalItems > page * ITEMS_PER_PAGE && (
              <button
                className="btn-secondary"
                onClick={() => setPage(page + 1)}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </div>
        </section>
      </main>
      <Footer></Footer>
    </>
  );
};

export default ViewResult;
