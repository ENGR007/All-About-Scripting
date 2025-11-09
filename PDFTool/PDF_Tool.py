# ==============================
# PDF TOOLBOX - SINGLE FILE EDITION
# ==============================
# File: C:\PDF_Tool\pdftool.py

import os
import datetime
import webbrowser
from flask import Flask, request, jsonify

import fitz                      # PyMuPDF
from PyPDF2 import PdfMerger
from PyPDF2 import PdfReader, PdfWriter
from pdf2docx import Converter


app = Flask(__name__)


def ts():
    return datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")


# ---------- MERGE ----------
@app.route("/merge", methods=["POST"])
def merge_pdf():
    pdfs = request.files.getlist("files[]")
    if not pdfs:
        return jsonify({"status":"no files"})

    first_path = pdfs[0].filename
    folder = os.path.dirname(first_path)
    out_path = os.path.join(folder, f"merged_{ts()}.pdf")

    merger = PdfMerger()
    for f in pdfs:
        merger.append(f.filename)
    merger.write(out_path)
    merger.close()

    return jsonify({"status":"done", "output":out_path})


# ---------- EXTRACT TEXT ----------
@app.route("/extract_text", methods=["POST"])
def extract_text():
    pdfs = request.files.getlist("files[]")
    if len(pdfs) != 1:
        return jsonify({"status":"need 1 file only"})

    pdf = pdfs[0]
    pdf_path = pdf.filename
    folder = os.path.dirname(pdf_path)
    base = os.path.splitext(os.path.basename(pdf_path))[0]

    out_path = os.path.join(folder, f"{base}_TEXT_{ts()}.txt")

    doc = fitz.open(pdf_path)
    full = ""
    for page in doc:
        full += page.get_text() + "\n"
    doc.close()

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full)

    return jsonify({"status":"done", "output":out_path})


# ---------- SPLIT ----------
@app.route("/split", methods=["POST"])
def split_pdf():
    pdfs = request.files.getlist("files[]")
    ranges_str = request.form.get("ranges","")

    if len(pdfs) != 1:
        return jsonify({"status":"need exactly 1 PDF"})

    if not ranges_str:
        return jsonify({"status":"no ranges provided"})

    pdf = pdfs[0]
    pdf_path = pdf.filename
    folder = os.path.dirname(pdf_path)
    base = os.path.splitext(os.path.basename(pdf_path))[0]

    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()

    ranges = [r.strip() for r in ranges_str.split(",") if r.strip()]
    outputs = []

    for r in ranges:
        if "-" not in r:
            return jsonify({"status": f"Invalid range syntax: {r}"})

        start_s, end_s = r.split("-")
        try:
            start = int(start_s) - 1
            end   = int(end_s) - 1
        except:
            return jsonify({"status": f"Invalid number in range: {r}"})

        if start < 0 or end < 0 or start > end:
            return jsonify({"status": f"Invalid ordering in range: {r}"})

        if end >= total_pages:
            return jsonify({"status": f"Range {r} exceeds page count {total_pages}"})

        reader = PdfReader(pdf_path)
        writer = PdfWriter()

        for p in range(start, end+1):
            writer.add_page(reader.pages[p])

        out_file = os.path.join(folder, f"{base}_{start+1}-{end+1}_{ts()}.pdf")
        with open(out_file, "wb") as fp:
            writer.write(fp)

        outputs.append(out_file)

    return jsonify({"status":"done", "outputs":outputs})


# ---------- PDF -> WORD ----------
@app.route("/pdf2word", methods=["POST"])
def pdf2word():
    pdfs = request.files.getlist("files[]")
    if len(pdfs) != 1:
        return jsonify({"status":"need 1 file only"})

    pdf = pdfs[0]
    pdf_path = pdf.filename
    folder = os.path.dirname(pdf_path)
    base = os.path.splitext(os.path.basename(pdf_path))[0]

    out_path = os.path.join(folder, f"{base}_{ts()}.docx")

    cv = Converter(pdf_path)
    cv.convert(out_path)
    cv.close()

    return jsonify({"status":"done", "output":out_path})


# ---------- HIGHLIGHT ----------
@app.route("/highlight", methods=["POST"])
def highlight_text():
    pdfs = request.files.getlist("files[]")
    text = request.form.get("text","")

    if len(pdfs) != 1:
        return jsonify({"status":"need 1 file only"})

    pdf = pdfs[0]
    pdf_path = pdf.filename
    folder = os.path.dirname(pdf_path)
    base = os.path.splitext(os.path.basename(pdf_path))[0]

    out_path = os.path.join(folder, f"{base}_HL_{ts()}.pdf")

    doc = fitz.open(pdf_path)
    for page in doc:
        areas = page.search_for(text)
        for rect in areas:
            page.add_highlight_annot(rect)
    doc.save(out_path)
    doc.close()

    return jsonify({"status":"done", "output":out_path})


# ---------- SEARCH&REPLACE ----------
@app.route("/search_replace", methods=["POST"])
def search_replace():
    pdfs = request.files.getlist("files[]")
    search = request.form.get("search", "")
    replace = request.form.get("replace", "")

    if len(pdfs) != 1:
        return jsonify({"status": "need exactly 1 PDF"})

    if not search:
        return jsonify({"status": "search text is empty"})
    if not replace:
        return jsonify({"status": "replace text is empty"})

    pdf = pdfs[0]
    pdf_path = pdf.filename
    folder = os.path.dirname(pdf_path)
    base = os.path.splitext(os.path.basename(pdf_path))[0]

    out_path = os.path.join(folder, f"{base}_SR_{ts()}.pdf")

    doc = fitz.open(pdf_path)
    replaced_count = 0

    for page in doc:
        rects = page.search_for(search)
        for r in rects:
            replaced_count += 1
            page.draw_rect(r, fill=(1,1,1))
            page.insert_textbox(r, replace, fontname="helv", fontsize=10, color=(0,0,0))

    doc.save(out_path)
    doc.close()

    return jsonify({"status":"done", "replaced_count": replaced_count, "output":out_path})
    
# ---------- UI HTML + JS ----------
@app.route("/")
def index_page():
    return """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>PDF Toolbox</title>
<style>
    body { font-family: Arial; margin: 30px; background: #f3f3f3; }
    .container { max-width: 900px; margin: auto; background:white; padding:30px; border-radius:12px; }
    .panel { border:1px solid #ccc; border-radius:8px; padding:20px; margin-bottom:20px; background:#fafafa; }
    .panel h3 { margin:0 0 10px 0; }
    .btn { padding:12px 18px; margin-top:10px; cursor:pointer; border: none; background:#1976d2; color:white; border-radius:6px; }
    select, input[type=text], input[type=file] { width:100%; padding:10px; margin-top:8px; box-sizing:border-box; }
    #extra_area { display:none; padding-top:10px; }
    #statusBox { background:black; color:#0f0; padding:10px; height:150px; overflow:auto; }
</style>
</head>
<body>
<div class="container">

    <h2>PDF Toolbox</h2>

    <div class="panel">
        <h3>Select Operation</h3>
        <select id="operation">
            <option disabled selected>-- Choose PDF Operation --</option>

            <optgroup label="Tier 1 Basic">
                <option value="merge">Merge PDF Files</option>
                <option value="extract_text">Extract Text</option>
                <option value="split">Split PDF by Ranges</option>
            </optgroup>

            <optgroup label="Tier 2 Productivity">
                <option value="pdf2word">Convert PDF to Word</option>
                <option value="highlight">Highlight Text</option>
                <option value="search_replace">Search & Replace Text</option>
            </optgroup>

        </select>
    </div>

    <div class="panel">
        <h3>Select Files</h3>
        <input id="fileInput" type="file" multiple>
    </div>

    <div class="panel" id="extra_area">
        <div id="extra_fields"></div>
    </div>

    <div class="panel">
        <button class="btn" id="runBtn">RUN</button>
    </div>

    <div class="panel">
        <h3>Status</h3>
        <pre id="statusBox">Ready...</pre>
    </div>

</div>

<script>
document.addEventListener("DOMContentLoaded", () => {

    const opSel = document.getElementById("operation");
    const extraArea = document.getElementById("extra_area");
    const extraFields = document.getElementById("extra_fields");
    const runBtn = document.getElementById("runBtn");
    const fileInput = document.getElementById("fileInput");
    const statusBox = document.getElementById("statusBox");

    opSel.addEventListener("change", () => {
        const op = opSel.value;
        extraFields.innerHTML = "";
        extraArea.style.display = "none";

        if (op === "highlight") {
            extraArea.style.display = "block";
            extraFields.innerHTML = `
                <label>Enter text to highlight:</label>
                <input id="textToHL" type="text" placeholder="e.g. Invoice #">
            `;
        }

        if (op === "split") {
            extraArea.style.display = "block";
            extraFields.innerHTML = `
                <label>Enter page ranges (example: 3-5,7-10,12-12)</label>
                <input id="ranges" type="text" placeholder="3-5,7-10,12-12">
            `;
        }

        if (op === "search_replace") {
            extraArea.style.display = "block";
            extraFields.innerHTML = `
                <label>Search for this text:</label>
                <input id="sr_search" type="text" placeholder="enter text to find">

                <label style="margin-top:12px; display:block;">Replace with this text:</label>
                <input id="sr_replace" type="text" placeholder="enter replacement text">
            `;
        }
    });

    runBtn.addEventListener("click", async () => {
        const op = opSel.value;
        if (!op) return alert("Select operation");
        if (fileInput.files.length === 0) return alert("Select file(s)");

        const form = new FormData();
        for (let f of fileInput.files) {
            form.append("files[]", f);
        }

        if (op === "highlight") {
            form.append("text", document.getElementById("textToHL").value);
        }

        if (op === "split") {
            form.append("ranges", document.getElementById("ranges").value);
        }

        if (op === "search_replace") {
            form.append("search", document.getElementById("sr_search").value);
            form.append("replace", document.getElementById("sr_replace").value);
        }

        statusBox.textContent = "Processing...";

        const res = await fetch(`/${op}`, { method: "POST", body: form });
        const j = await res.json();
        statusBox.textContent = JSON.stringify(j, null, 2);
    });

});
</script>

</body>
</html>
"""
    

# ---------- MAIN ----------
if __name__ == "__main__":
    url = "http://127.0.0.1:5000"
    webbrowser.open(url)
    app.run(debug=False)




