import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Location } from '@/data/locations';

export function exportLocationsToPDF(locations: Location[], filters?: { type?: string; region?: string }) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 255, 135);
  doc.text('Street Art France', 14, 20);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Liste des lieux', 14, 28);

  // Filters info
  if (filters) {
    let filterText = '';
    if (filters.type && filters.type !== 'all') {
      filterText += `Type: ${filters.type} `;
    }
    if (filters.region && filters.region !== 'all') {
      filterText += `Région: ${filters.region}`;
    }
    if (filterText) {
      doc.setFontSize(10);
      doc.text(filterText, 14, 34);
    }
  }

  // Table data
  const tableData = locations.map(loc => [
    loc.name,
    loc.type === 'gallery' ? 'Galerie' : loc.type === 'association' ? 'Association' : 'Festival',
    loc.city,
    loc.region,
  ]);

  // Generate table
  autoTable(doc, {
    head: [['Nom', 'Type', 'Ville', 'Région']],
    body: tableData,
    startY: filters ? 40 : 35,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 255, 135],
      textColor: [10, 10, 10],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [25, 25, 25],
    },
    styles: {
      textColor: [255, 255, 255],
      fontSize: 9,
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} sur ${pageCount} - ${new Date().toLocaleDateString('fr-FR')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save the PDF
  const fileName = `street-art-france-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
