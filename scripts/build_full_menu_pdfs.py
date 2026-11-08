import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

mie_items = [
    {
        'name': 'Elon Dark Matter',
        'price': 'Rp28.000',
        'desc': 'Mie hitam dari tinta cumi dengan ayam panggang, jamur, dan saus bawang putih creamy. Rasa gurih dengan tampilan gelap yang terinspirasi dari misteri alam semesta.'
    },
    {
        'name': 'Tesla Reactor',
        'price': 'Rp27.000',
        'desc': 'Mie dengan saus miso pedas dan mentega, daging cincang, telur setengah matang, serta daun bawang. Gurih, creamy, dan pedas dengan sensasi rasa yang kuat.'
    },
    {
        'name': 'SpaceX Orbit Crunch',
        'price': 'Rp30.000',
        'desc': 'Mie goreng renyah berbentuk sarang, disiram saus kental berisi daging sapi, jamur, dan sayuran. Kombinasi tekstur renyah dan lembut dalam satu hidangan.'
    },
    {
        'name': 'Full Stack',
        'price': 'Rp32.000',
        'desc': 'Mie spesial dengan ayam panggang, bakso, pangsit renyah, telur, dan sayuran. Semua komponen digabungkan menjadi satu hidangan lengkap, terinspirasi dari konsep full stack dalam dunia pemrograman.'
    },
    {
        'name': 'Mars Colony Curry',
        'price': 'Rp26.000',
        'desc': 'Mie dengan kuah kari kental berwarna keemasan, ayam renyah, jagung manis, dan daun bawang. Kaya rempah dan menghangatkan, terinspirasi dari hidangan koloni manusia di Mars.'
    }
]

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

def create_single_menu(output_path, title_text, subtitle_text, items, category_badge, badge_color):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=16*mm,
        rightMargin=16*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )
    styles = getSampleStyleSheet()
    
    brand_style = ParagraphStyle(
        'BrandTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=24, leading=28,
        textColor=colors.HexColor('#180A04')
    )
    subbrand_style = ParagraphStyle(
        'SubBrand', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10.5, leading=14,
        textColor=colors.HexColor('#57534E')
    )
    badge_style = ParagraphStyle(
        'Badge', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=13,
        textColor=colors.HexColor('#180A04'), alignment=1
    )
    section_title_style = ParagraphStyle(
        'SectionTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=17, leading=21,
        textColor=colors.HexColor('#180A04')
    )
    item_title_style = ParagraphStyle(
        'ItemTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13.5, leading=17,
        textColor=colors.HexColor('#180A04')
    )
    price_style = ParagraphStyle(
        'ItemPrice', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        textColor=colors.HexColor('#B45309'), alignment=2
    )
    desc_style = ParagraphStyle(
        'ItemDesc', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10.5, leading=15,
        textColor=colors.HexColor('#374151')
    )
    footer_style = ParagraphStyle(
        'FooterStyle', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=13,
        textColor=colors.HexColor('#78716C'), alignment=1
    )
    
    story = []
    brand_p = Paragraph('<b>MIE ELON MUSK</b>', brand_style)
    sub_p = Paragraph('Sensasi Pedas Futuristik No. 1 di Cikarang • Sejak 2026', subbrand_style)
    badge_p = Paragraph(f'<b>{category_badge}</b>', badge_style)
    
    badge_cell = Table([[badge_p]], colWidths=[44*mm], rowHeights=[11*mm])
    badge_cell.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), badge_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    
    header_table = Table([[Table([[brand_p], [sub_p]], colWidths=[132*mm]), badge_cell]], colWidths=[134*mm, 44*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width='100%', thickness=2.5, color=colors.HexColor('#FFBC0D'), spaceBefore=2, spaceAfter=14))
    
    sec_p = Paragraph(f'<b>{title_text}</b>', section_title_style)
    sec_sub = Paragraph(subtitle_text, subbrand_style)
    story.append(sec_p)
    story.append(Spacer(1, 3))
    story.append(sec_sub)
    story.append(Spacer(1, 14))
    
    for idx, it in enumerate(items):
        item_num = idx + 1
        name_p = Paragraph(f'<b>{item_num}. {it["name"]}</b>', item_title_style)
        price_p = Paragraph(f'<b>{it["price"]}</b>', price_style)
        desc_p = Paragraph(it['desc'], desc_style)
        
        row_table = Table([[name_p, price_p]], colWidths=[126*mm, 46*mm])
        row_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        
        item_box = Table([[row_table], [Spacer(1, 4)], [desc_p]], colWidths=[178*mm])
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
    print(f'Generated {output_path}')

os.makedirs('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu', exist_ok=True)
os.makedirs('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu', exist_ok=True)

# 1. Menu Mie Elon Musk
create_single_menu(
    'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Mie_Mie_Mas_Elon.pdf',
    'Daftar Menu Hidangan Utama Mie Elon Musk',
    'Racikan mie kenyal istimewa dengan bumbu futuristik kaya rempah & cita rasa khas',
    mie_items,
    'NOODLES',
    colors.HexColor('#FFBC0D')
)

# 2. Menu Minuman Elon Musk
create_single_menu(
    'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Minuman_Mie_Mas_Elon.pdf',
    'Daftar Menu Minuman Dingin & Segar',
    'Racikan minuman dingin pelepas dahaga pendamping setia mie pedas',
    minuman_items,
    'BEVERAGES',
    colors.HexColor('#FFBC0D')
)

# 3. Menu Cemilan Elon Musk
create_single_menu(
    'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Cemilan_Mie_Mas_Elon.pdf',
    'Daftar Menu Cemilan Krispi & Gurih',
    'Snack renyah spesial pendamping santai dan nongkrong seru',
    cemilan_items,
    'SNACKS',
    colors.HexColor('#FFBC0D')
)

downloads_dir = r'C:\Users\tbiqb\Downloads'
shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Mie_Mie_Mas_Elon.pdf', os.path.join(downloads_dir, 'menu mie rapih.pdf'))
shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Minuman_Mie_Mas_Elon.pdf', os.path.join(downloads_dir, 'menu minuman rapih.pdf'))
shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Cemilan_Mie_Mas_Elon.pdf', os.path.join(downloads_dir, 'menu cemilan rapih.pdf'))

shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Mie_Mie_Mas_Elon.pdf', 'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu/Menu_Mie_Mie_Mas_Elon.pdf')
shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Minuman_Mie_Mas_Elon.pdf', 'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu/Menu_Minuman_Mie_Mas_Elon.pdf')
shutil.copy2('D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/docs/menu/Menu_Cemilan_Mie_Mas_Elon.pdf', 'D:/Iqbal/PEMROGRAMAN-WEB-1-NEW/public/docs/menu/Menu_Cemilan_Mie_Mas_Elon.pdf')

print('All 3 individual menu PDFs updated and copied!')
