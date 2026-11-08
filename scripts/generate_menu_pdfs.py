import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

def create_styled_menu(output_path, title_text, subtitle_text, items, category_badge, badge_color):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=16*mm,
        rightMargin=16*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles - sized clearly and legibly ("ukuran harus rapih jangan terlalu kecil")
    brand_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#180A04'),
        alignment=0
    )
    
    subbrand_style = ParagraphStyle(
        'SubBrand',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#57534E'),
        alignment=0
    )
    
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#180A04'),
        alignment=1
    )
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=colors.HexColor('#180A04')
    )
    
    item_title_style = ParagraphStyle(
        'ItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=17,
        textColor=colors.HexColor('#180A04')
    )
    
    price_style = ParagraphStyle(
        'ItemPrice',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#B45309'),
        alignment=2
    )
    
    desc_style = ParagraphStyle(
        'ItemDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor('#374151')
    )
    
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#78716C'),
        alignment=1
    )
    
    story = []
    
    # Header Table: Brand & Badge
    brand_p = Paragraph('<b>MIE ELON MUSK</b>', brand_style)
    sub_p = Paragraph('Sensasi Pedas Futuristik No. 1 di Cikarang • Sejak 2026', subbrand_style)
    badge_p = Paragraph(f'<b>{category_badge}</b>', badge_style)
    
    badge_cell = Table(
        [[badge_p]],
        colWidths=[42*mm],
        rowHeights=[11*mm]
    )
    badge_cell.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), badge_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    
    header_table = Table(
        [[Table([[brand_p], [sub_p]], colWidths=[132*mm]), badge_cell]],
        colWidths=[134*mm, 44*mm]
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # Divider Line (Amber Brand Color)
    story.append(HRFlowable(width='100%', thickness=2.5, color=colors.HexColor('#FFBC0D'), spaceBefore=2, spaceAfter=14))
    
    # Section Header
    sec_p = Paragraph(f'<b>{title_text}</b>', section_title_style)
    sec_sub = Paragraph(subtitle_text, subbrand_style)
    story.append(sec_p)
    story.append(Spacer(1, 3))
    story.append(sec_sub)
    story.append(Spacer(1, 14))
    
    # Render Items
    for idx, it in enumerate(items):
        item_num = idx + 1
        name_p = Paragraph(f'<b>{item_num}. {it["name"]}</b>', item_title_style)
        price_p = Paragraph(f'<b>{it["price"]}</b>', price_style)
        desc_p = Paragraph(it['desc'], desc_style)
        
        row_table = Table(
            [[name_p, price_p]],
            colWidths=[126*mm, 46*mm]
        )
        row_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        
        # Card container for item with clean border & padding
        item_box = Table(
            [[row_table], [Spacer(1, 4)], [desc_p]],
            colWidths=[178*mm]
        )
        item_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FAFAF9')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E7E5E4')),
            ('ROUNDEDCORNERS', [8, 8, 8, 8]),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ]))
        
        story.append(item_box)
        story.append(Spacer(1, 11))
        
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=0.8, color=colors.HexColor('#E5E7EB'), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph('Dine-In • Takeaway • Delivery • Outlet Cikarang • Hubungi Kasir untuk Kustomisasi', footer_style))
    
    doc.build(story)
    print(f'Successfully generated {output_path}')


def create_combined_menu(output_path, minuman_items, cemilan_items):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=14*mm,
        rightMargin=14*mm,
        topMargin=12*mm,
        bottomMargin=12*mm
    )
    styles = getSampleStyleSheet()
    
    brand_style = ParagraphStyle(
        'CombBrand', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=22, leading=26,
        textColor=colors.HexColor('#180A04')
    )
    subbrand_style = ParagraphStyle(
        'CombSub', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=13,
        textColor=colors.HexColor('#57534E')
    )
    col_header_style = ParagraphStyle(
        'ColHeader', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=16,
        textColor=colors.HexColor('#180A04')
    )
    col_badge_style = ParagraphStyle(
        'ColBadge', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=9, leading=11,
        textColor=colors.HexColor('#180A04'), alignment=1
    )
    name_style = ParagraphStyle(
        'ItemName', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=13,
        textColor=colors.HexColor('#180A04')
    )
    price_style = ParagraphStyle(
        'ItemPrice', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=13,
        textColor=colors.HexColor('#B45309'), alignment=2
    )
    desc_style = ParagraphStyle(
        'ItemDesc', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=11.5,
        textColor=colors.HexColor('#44403C')
    )
    footer_style = ParagraphStyle(
        'CombFoot', parent=styles['Normal'],
        fontName='Helvetica', fontSize=8.5, leading=11,
        textColor=colors.HexColor('#78716C'), alignment=1
    )

    story = []
    # Header
    story.append(Paragraph('<b>MIE ELON MUSK — KATALOG RESMI</b>', brand_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph('Daftar Lengkap Minuman Segar & Cemilan Krispi • Sejak 2026 • Cikarang', subbrand_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#FFBC0D'), spaceBefore=0, spaceAfter=10))

    # Helper for rendering 1 column of items
    def render_column(title, badge_text, items, col_w=87*mm):
        col_story = []
        # Column title with badge
        title_p = Paragraph(f'<b>{title}</b>', col_header_style)
        badge_p = Paragraph(f'<b>{badge_text}</b>', col_badge_style)
        b_cell = Table([[badge_p]], colWidths=[24*mm], rowHeights=[6.5*mm])
        b_cell.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFD400')),
            ('ROUNDEDCORNERS', [3, 3, 3, 3]),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        head_row = Table([[title_p, b_cell]], colWidths=[col_w - 26*mm, 25*mm])
        head_row.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        col_story.append(head_row)
        col_story.append(Spacer(1, 6))

        for idx, it in enumerate(items):
            n_p = Paragraph(f'<b>{idx+1}. {it["name"]}</b>', name_style)
            p_p = Paragraph(f'<b>{it["price"]}</b>', price_style)
            d_p = Paragraph(it['desc'], desc_style)

            top_line = Table([[n_p, p_p]], colWidths=[col_w - 30*mm, 26*mm])
            top_line.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ]))

            card = Table([[top_line], [Spacer(1, 2)], [d_p]], colWidths=[col_w - 4*mm])
            card.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F5F5F4')),
                ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#E7E5E4')),
                ('ROUNDEDCORNERS', [5, 5, 5, 5]),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            col_story.append(card)
            col_story.append(Spacer(1, 6))

        return col_story

    col_minuman = render_column('MINUMAN SEGAR', 'BEVERAGE', minuman_items, col_w=89*mm)
    col_cemilan = render_column('CEMILAN KRISPI', 'SNACKS', cemilan_items, col_w=89*mm)

    two_col_table = Table([[col_minuman, col_cemilan]], colWidths=[91*mm, 91*mm])
    two_col_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(two_col_table)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=0.8, color=colors.HexColor('#E5E7EB'), spaceBefore=2, spaceAfter=6))
    story.append(Paragraph('Dine-In • Takeaway • Delivery • Cikarang • Harga tertera sudah termasuk pajak', footer_style))

    doc.build(story)
    print(f'Successfully generated {output_path}')


if __name__ == '__main__':
    minuman_items = [
        {
            'name': 'Starlink Blue',
            'price': 'Rp12.000',
            'desc': 'Soda biru dengan perpaduan sirup lemon dan es batu yang menyegarkan. Memiliki rasa manis dengan sentuhan asam yang pas.'
        },
        {
            'name': 'Grok Choco',
            'price': 'Rp15.000',
            'desc': 'Minuman cokelat dingin dengan susu creamy dan siraman saus cokelat yang kaya rasa. Perpaduan manis dan pekat untuk pencinta cokelat.'
        },
        {
            'name': 'Neuralink Matcha',
            'price': 'Rp16.000',
            'desc': 'Perpaduan matcha khas dengan susu dingin yang creamy dan lembut. Memiliki warna hijau yang menarik dengan cita rasa teh hijau yang khas.'
        },
        {
            'name': 'Tesla Caramel Latte',
            'price': 'Rp18.000',
            'desc': 'Perpaduan espresso, susu dingin, dan sirup karamel yang menghasilkan rasa kopi yang kaya dengan sentuhan manis dan aroma karamel yang menggoda.'
        },
        {
            'name': 'Mars Strawberry Milk',
            'price': 'Rp14.000',
            'desc': 'Susu stroberi dingin dengan rasa manis dan sedikit asam yang menyegarkan. Warna merah muda yang cantik berpadu dengan rasa stroberi yang lembut dan fruity.'
        }
    ]

    cemilan_items = [
        {
            'name': 'Rocket Pop Chicken',
            'price': 'Rp18.000',
            'desc': 'Potongan ayam crispy dengan bumbu gurih dan balutan saus pedas manis yang menggugah selera.'
        },
        {
            'name': 'Orbit Crunch',
            'price': 'Rp12.000',
            'desc': 'Pangsit goreng tipis dan renyah, disajikan dengan saus mayo pedas yang creamy dan lezat.'
        },
        {
            'name': 'Fusion Cheese Bites',
            'price': 'Rp16.000',
            'desc': 'Bola-bola keju berlapis tepung renyah dengan isian keju lumer yang lembut di setiap gigitan.'
        },
        {
            'name': 'Neuralink Enoki',
            'price': 'Rp15.000',
            'desc': 'Jamur enoki berbalut tepung renyah dengan tekstur ringan dan gurih, disajikan bersama saus mayo pedas yang creamy dan menggugah selera.'
        },
        {
            'name': 'Mars Potato Wedges',
            'price': 'Rp14.000',
            'desc': 'Potongan kentang tebal dengan kulit renyah, dibumbui paprika dan disajikan bersama saus keju yang creamy.'
        }
    ]

    os.makedirs('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu', exist_ok=True)
    os.makedirs('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu', exist_ok=True)

    # 1. Menu Minuman Lengkap
    create_styled_menu(
        'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Minuman_Mie_Mas_Elon.pdf',
        'Daftar Menu Minuman Dingin & Segar',
        'Racikan minuman dingin pelepas dahaga pendamping setia mie pedas',
        minuman_items,
        'BEVERAGES',
        colors.HexColor('#FFBC0D')
    )

    # 2. Menu Cemilan Lengkap
    create_styled_menu(
        'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Cemilan_Mie_Mas_Elon.pdf',
        'Daftar Menu Cemilan Krispi & Gurih',
        'Snack renyah spesial pendamping santai dan nongkrong seru',
        cemilan_items,
        'SNACKS',
        colors.HexColor('#FFBC0D')
    )

    # 3. Menu Gabungan 1 Lembar (Two-Column Poster Menu)
    create_combined_menu(
        'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Lengkap_Minuman_Cemilan_Mie_Mas_Elon.pdf',
        minuman_items,
        cemilan_items
    )

    # Copy all generated PDFs to public/docs/menu for direct web access/download
    for f in ['Menu_Minuman_Mie_Mas_Elon.pdf', 'Menu_Cemilan_Mie_Mas_Elon.pdf', 'Menu_Lengkap_Minuman_Cemilan_Mie_Mas_Elon.pdf']:
        shutil.copy2(f'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/{f}', f'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu/{f}')
    print('All menu PDFs generated and saved neatly!')
