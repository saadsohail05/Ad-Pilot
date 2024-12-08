from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from io import BytesIO
import re
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.styles import ParagraphStyle as PS

class BorderedDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        SimpleDocTemplate.__init__(self, *args, **kwargs)
        self.border_color = HexColor('#1a237e')
        self.border_width = 1.5
        
    def handle_pageBegin(self):
        self._handle_pageBegin()
        self._draw_border()
        
    def _draw_border(self):
        canvas = self.canv
        canvas.saveState()
        canvas.setStrokeColor(self.border_color)
        canvas.setLineWidth(self.border_width)
        
        # Simple elegant border with rounded corners
        width, height = letter
        margin = 25
        radius = 15
        
        # Define the border rectangle
        x1, y1 = margin, margin
        x2, y2 = width - margin, height - margin
        
        # Draw rounded border
        canvas.roundRect(x1, y1, x2-x1, y2-y1, radius, stroke=1, fill=0)
        
        canvas.restoreState()

def add_section_box(content, style, background_color='#f5f5f5', border_color='#1a237e', padding=10):
    """Create a boxed section with background color and border"""
    data = [[content]]
    table = Table(data, colWidths=[6.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor(background_color)),
        ('BOX', (0, 0), (-1, -1), 2, HexColor(border_color)),
        ('TOPPADDING', (0, 0), (-1, -1), padding),
        ('BOTTOMPADDING', (0, 0), (-1, -1), padding),
        ('LEFTPADDING', (0, 0), (-1, -1), padding),
        ('RIGHTPADDING', (0, 0), (-1, -1), padding),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    return table

def clean_text(text: str) -> str:
    """Clean and format the text properly"""
    # Handle bullet points and double asterisks with line breaks
    text = re.sub(r'\*\*([^*]+)\*\*', r'\n\1\n', text)  # Handle **text**
    text = re.sub(r'\*([^*\n]+)', r'\n• \1\n', text)    # Handle *text
    text = re.sub(r'[\n\s]*\*\s*', '\n• ', text)        # Clean up bullet points
    
    # Fix spacing and formatting
    text = re.sub(r'\s+', ' ', text)                     # Remove multiple spaces
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)       # Remove excessive line breaks
    text = re.sub(r'(?<=\.)(?=\w)', ' ', text)          # Add space after periods
    text = re.sub(r'(?<=\w)(?=[A-Z])', ' ', text)       # Add space between words
    text = re.sub(r'\n• \s*', '\n• ', text)             # Clean up bullet point spacing
    
    # Ensure spacing around bullet points
    text = re.sub(r'([^\n])(?=\n• )', r'\1\n', text)    # Add space before bullet
    text = re.sub(r'(• [^\n]+)(?=\n[^• ])', r'\1\n', text)  # Add space after bullet content
    
    return text.strip()

def create_market_analysis_pdf(report_data: dict) -> BytesIO:
    buffer = BytesIO()
    doc = BorderedDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Updated styling with professional fonts and spacing
    title_style = PS(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        spaceAfter=15,
        textColor=HexColor('#000000'),
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
        leading=24
    )
    
    section_style = PS(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=8,
        spaceBefore=16,
        textColor=HexColor('#000000'),
        fontName='Helvetica-Bold',
        leading=18,
        borderPadding=(0, 0, 3, 0)
    )
    
    subsection_style = PS(
        'SubSection',
        parent=styles['Heading3'],
        fontSize=12,
        spaceAfter=6,
        spaceBefore=12,
        textColor=HexColor('#000000'),
        fontName='Helvetica-Bold',
        leading=16,
        borderPadding=(0, 0, 2, 8)
    )
    
    body_style = PS(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=9,
        spaceAfter=6,
        spaceBefore=4,
        textColor=HexColor('#000000'),
        fontName='Helvetica',
        alignment=TA_JUSTIFY,
        leading=12
    )
    
    bullet_style = PS(
        'BulletPoint',
        parent=body_style,
        fontSize=9,
        leftIndent=15,
        firstLineIndent=0,
        spaceBefore=3,
        spaceAfter=3,
        bulletIndent=8,
        leading=12,
        textColor=HexColor('#000000')
    )

    # Add title
    story.append(Paragraph("Market Analysis Report", title_style))
    story.append(Spacer(1, 15))

    # Enhanced metadata table with professional styling
    metadata = report_data.get('metadata', {})
    meta_data = [
        ['Product', metadata.get('product', 'N/A').title()],  # Proper case
        ['Category', metadata.get('category', 'N/A').title()],
        ['Product Type', metadata.get('product_type', 'N/A').title()]
    ]
    
    meta_table = Table(meta_data, colWidths=[1.2*inch, 5.3*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#f5f5f5')),  # Light gray background
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#000000')),  # Black text
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),  # Smaller font size
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e0e0e0')),  # Lighter grid
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#cccccc')),  # Subtle border
    ]))
    
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Process content with better formatting
    analysis_content = report_data.get('analysis_report', '')
    if analysis_content:
        # Clean and format the content
        analysis_content = clean_text(analysis_content)
        
        sections = analysis_content.split('#')
        for section in sections:
            if not section.strip():
                continue
                
            lines = section.strip().split('\n')
            if lines:
                # Process section title
                section_title = lines[0].strip()
                if section_title:
                    story.append(Paragraph(section_title, section_style))
                    story.append(Spacer(1, 6))
                
                content = '\n'.join(lines[1:])
                subsections = content.split('##')
                
                for subsection in subsections:
                    if not subsection.strip():
                        continue
                        
                    sub_lines = [line for line in subsection.strip().split('\n') if line.strip()]
                    if sub_lines:
                        # Process subsection title
                        if sub_lines[0].strip():
                            story.append(Paragraph(sub_lines[0].strip(), subsection_style))
                            story.append(Spacer(1, 4))
                        
                        # Group and process content with better spacing
                        current_bullets = []
                        current_paragraph = []
                        
                        for line in sub_lines[1:]:
                            line = line.strip()
                            if line.startswith('*'):
                                if current_paragraph:
                                    story.append(Paragraph(' '.join(current_paragraph), body_style))
                                    story.append(Spacer(1, 3))  # Add small space after paragraph
                                    current_paragraph = []
                                current_bullets.append(line[1:].strip())
                            elif line:
                                if current_bullets:
                                    bullet_text = '<br/><br/>'.join([f'• {b}' for b in current_bullets])
                                    story.append(Paragraph(bullet_text, bullet_style))
                                    story.append(Spacer(1, 4))  # Add space after bullet points
                                    current_bullets = []
                                current_paragraph.append(line)
                        
                        # Add remaining content
                        if current_bullets:
                            bullet_text = '<br/><br/>'.join([f'• {b}' for b in current_bullets])
                            story.append(Paragraph(bullet_text, bullet_style))
                            story.append(Spacer(1, 4))
                        
                        if current_paragraph:
                            story.append(Paragraph(' '.join(current_paragraph), body_style))
                            story.append(Spacer(1, 3))
                        
                        story.append(Spacer(1, 6))
                
                story.append(Spacer(1, 8))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer