// import React, { useState } from "react";
// import axios from "axios";

// function UploadForm() {
//     const [file, setFile] = useState(null);
//     const [preview, setPreview] = useState(null);
//     const [processedImage, setProcessedImage] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const handleFileChange = (event) => {
//         const selectedFile = event.target.files[0];
//         setFile(selectedFile);
//         setPreview(URL.createObjectURL(selectedFile));
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

//             setProcessedImage(`http://localhost:5000${response.data.fileUrl}`);
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             alert("Error uploading file.");
//         } finally {
//             setLoading(false);
//         }
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
//                     <a href={processedImage} download="processed_image.jpeg">
//                         <button style={{ marginTop: "10px", padding: "10px" }}>Download Image</button>
//                     </a>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default UploadForm;


import React, { useState } from "react";
import axios from "axios";

function UploadForm() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.fileUrl) {
                setProcessedImage(response.data.fileUrl); // base64 image string
            } else {
                alert("File processing failed. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!processedImage) return;

        const link = document.createElement("a");
        link.href = processedImage;
        link.setAttribute("download", "processed_image.jpeg");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", maxWidth: "400px", margin: "auto" }}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: "100%", marginTop: "10px" }} />}
            <button onClick={handleUpload} disabled={loading} style={{ marginTop: "10px", padding: "10px" }}>
                {loading ? "Processing..." : "Upload & Adjust"}
            </button>

            {processedImage && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Processed Image:</h3>
                    <img src={processedImage} alt="Processed" style={{ width: "100%" }} />
                    <button onClick={handleDownload} style={{ marginTop: "10px", padding: "10px" }}>
                        Download Image
                    </button>
                </div>
            )}
        </div>
    );
}

export default UploadForm;
