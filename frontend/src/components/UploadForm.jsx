// import React, { useState } from "react";
// import axios from "axios";

// function UploadForm() {
//     const [file, setFile] = useState(null);
//     const [preview, setPreview] = useState(null);
//     const [processedImage, setProcessedImage] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const handleFileChange = (event) => {
//         const selectedFile = event.target.files[0];
//         if (selectedFile) {
//             setFile(selectedFile);
//             setPreview(URL.createObjectURL(selectedFile));
//         }
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             alert("Please select a file first.");
//             return;
//         }

//         const formData = new FormData();
//         formData.append("file", file);

//         try {
//             setLoading(true);
//             const response = await axios.post("http://localhost:5000/api/upload", formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             if (response.data.fileUrl) {
//                 setProcessedImage(response.data.fileUrl); // base64 image string
//             } else {
//                 alert("File processing failed. Please try again.");
//             }
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             alert("Error uploading file.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDownload = () => {
//         if (!processedImage) return;

//         const link = document.createElement("a");
//         link.href = processedImage;
//         link.setAttribute("download", "processed_image.jpeg");
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     return (
//         <div style={{ padding: "20px", border: "1px solid #ccc", maxWidth: "400px", margin: "auto" }}>
//             <input type="file" accept="image/*" onChange={handleFileChange} />
//             {preview && <img src={preview} alt="Preview" style={{ width: "100%", marginTop: "10px" }} />}
//             <button onClick={handleUpload} disabled={loading} style={{ marginTop: "10px", padding: "10px" }}>
//                 {loading ? "Processing..." : "Upload & Adjust"}
//             </button>

//             {processedImage && (
//                 <div style={{ marginTop: "20px" }}>
//                     <h3>Processed Image:</h3>
//                     <img src={processedImage} alt="Processed" style={{ width: "100%" }} />
//                     <button onClick={handleDownload} style={{ marginTop: "10px", padding: "10px" }}>
//                         Download Image
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default UploadForm;


import React, { useState, useEffect } from "react";
import axios from "axios";

function UploadForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [exam, setExam] = useState(""); 
  const [constraints, setConstraints] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingDetails, setProcessingDetails] = useState(null);

  // Search for exams
  const searchExams = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${query}`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Error searching for exams:", error);
      setSearchResults([]);
    }
  };

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      searchExams(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch exam constraints from backend
  const fetchConstraints = async (examName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/constraints/${examName}`);
      setConstraints(response.data);
    } catch (error) {
      console.error("Error fetching constraints:", error);
      setConstraints(null);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleExamSelect = (selectedExam) => {
    setExam(selectedExam.name.toLowerCase());
    setConstraints(selectedExam.constraints);
    setSearchQuery(selectedExam.name);
    setSearchResults([]); // Clear results after selection
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !exam) {
      alert("Please select an exam and upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("exam", exam);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProcessedImage(response.data.fileUrl);
      setProcessingDetails({
        quality: response.data.finalQuality,
        size: response.data.sizeKB,
        dimensions: response.data.dimensions,
        format: response.data.format
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a download link
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `processed_${exam}_photo.${constraints?.type || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ maxWidth: "500px", margin: "20px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Exam Photo Formatter</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="examSearch" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Search Exam:
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="examSearch"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Type to search for exams..."
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", width: "100%", maxHeight: "200px", overflowY: "auto", zIndex: 10, border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "black", marginTop: "2px" }}>
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  onClick={() => handleExamSelect(result)}
                  style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", hover: { backgroundColor: "#f5f5f5" } }}
                >
                  {result.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {constraints && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "black", borderRadius: "4px" }}>
          <h4 style={{ marginTop: 0 }}>Requirements for {exam.toUpperCase()}:</h4>
          <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
            <li>Dimensions: {constraints.width}x{constraints.height} pixels</li>
            <li>Format: {constraints.type.toUpperCase()}</li>
            <li>Size: {constraints.size[0]}-{constraints.size[1]} KB</li>
          </ul>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="fileUpload" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Upload Photo:
        </label>
        <input 
          id="fileUpload"
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} 
        />
      </div>

      {preview && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h4>Original Preview:</h4>
          <img 
            src={preview} 
            alt="Preview" 
            style={{ maxWidth: "100%", maxHeight: "300px", border: "1px solid #ddd" }} 
          />
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={loading || !file || !exam} 
        style={{ 
          width: "100%", 
          padding: "12px",  
          backgroundColor:"#4CAF50", 
          color: "white", 
          border: "none", 
          borderRadius: "4px", 
          cursor: loading || !file || !exam ? "not-allowed" : "pointer",
          opacity: loading || !file || !exam ? 0.7 : 1
        }}
      >
        {loading ? "Processing..." : "Process Image"}
      </button>

      {processedImage && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Processed Image</h3>
          <img 
            src={processedImage} 
            alt="Processed" 
            style={{ maxWidth: "100%", maxHeight: "300px", border: "1px solid #ddd" }} 
          />
          
          {processingDetails && (
            <div style={{ margin: "15px 0", padding: "10px", backgroundColor: "black", borderRadius: "4px", textAlign: "left" }}>
              <p><strong>Final Size:</strong> {processingDetails.size} KB</p>
              <p><strong>Dimensions:</strong> {processingDetails.dimensions}</p>
              <p><strong>Format:</strong> {processingDetails.format}</p>
              <p><strong>Quality:</strong> {processingDetails.quality}%</p>
            </div>
          )}
          
          <button 
            onClick={handleDownload}
            style={{ 
              padding: "12px 24px", 
              backgroundColor: "#2196F3", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Download Image
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadForm;