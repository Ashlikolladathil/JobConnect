from io import BytesIO

from pypdf import PdfReader
from docx import Document


def extract_resume_text(uploaded_file):
    filename = uploaded_file.name.lower()

    if filename.endswith('.pdf'):
        reader = PdfReader(uploaded_file)

        text = '\n'.join(
            page.extract_text() or ''
            for page in reader.pages
        )

    elif filename.endswith('.docx'):
        document = Document(uploaded_file)

        text = '\n'.join(
            paragraph.text
            for paragraph in document.paragraphs
        )

    else:
        raise ValueError(
            'Unsupported file format. Upload a PDF or DOCX file.'
        )

    return text.strip()