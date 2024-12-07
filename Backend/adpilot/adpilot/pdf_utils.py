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

def create_market_analysis_pdf(analysis_data: dict) -> BytesIO:
    buffer = BytesIO()
    doc = BorderedDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=30
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Modern styling
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        spaceAfter=30,
        textColor=HexColor('#1a237e'),
        fontName='Helvetica-Bold'
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=20,
        spaceAfter=15,
        textColor=HexColor('#303f9f'),
        fontName='Helvetica-Bold',
        spaceBefore=25
    )
    
    subsection_style = ParagraphStyle(
        'SubSection',
        parent=styles['Heading3'],
        fontSize=14,
        spaceAfter=10,
        textColor=HexColor('#3949ab'),
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=14,
        textColor=HexColor('#263238')
    )
    
    # Add title and metadata
    story.append(Paragraph("Market Analysis Report", title_style))
    
    # Enhanced metadata table
    metadata = analysis_data.get('metadata', {})
    meta_data = [
        ['Product', metadata.get('product', 'N/A')],
        ['Category', metadata.get('category', 'N/A')],
        ['Product Type', metadata.get('product_type', 'N/A')]
    ]
    
    meta_table = Table(meta_data, colWidths=[1.5*inch, 5*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#e3f2fd')),  # Lighter blue background
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#1a237e')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#bbdefb')),  # Lighter grid lines
        ('BOX', (0, 0), (-1, -1), 2, HexColor('#1976d2')),  # Stronger border
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),  # Add rounded corners
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 30))

    # Process content
    analysis_text = analysis_data.get('analysis_report', '')
    
    # Split into sections and format
    sections = re.split(r'\*\*(.*?)\*\*', analysis_text)
    
    for i in range(1, len(sections), 2):
        section_title = sections[i].strip()
        section_content = sections[i+1].strip()
        
        story.append(Paragraph(section_title, section_style))
        story.append(Spacer(1, 10))
        
        # Process subsections with enhanced boxing
        subsections = section_content.split('\n\n')
        for subsection in subsections:
            if subsection.strip():
                if subsection.startswith('*') or subsection.startswith('+'):
                    bullet_points = re.split(r'\n[*+]', subsection)
                    bullet_content = []
                    for point in bullet_points:
                        if point.strip():
                            bullet_content.append(Paragraph(
                                f"• {point.strip()}", 
                                body_style
                            ))
                    # Add bullets in a colored box
                    for bullet in bullet_content:
                        story.append(add_section_box(
                            bullet, 
                            body_style,
                            background_color='#f3e5f5',
                            border_color='#7b1fa2'
                        ))
                else:
                    # Add regular content in a colored box
                    story.append(add_section_box(
                        Paragraph(subsection.strip(), body_style),
                        body_style,
                        background_color='#e8f5e9',
                        border_color='#2e7d32'
                    ))
                story.append(Spacer(1, 8))
        
        story.append(Spacer(1, 15))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer