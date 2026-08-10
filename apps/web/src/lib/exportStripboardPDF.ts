import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Scene {
  id: string;
  scene_number: string;
  scene_name?: string;
  location_name: string;
  scene_type: 'int' | 'ext' | 'int_ext';
  time_of_day: 'day' | 'night' | 'dawn' | 'dusk' | 'magic_hour';
  page_count?: number;
  estimated_duration?: number;
  description?: string;
  complexity_rating?: number;
  shoot_date?: string;
  status?: string;
  scene_characters?: Array<{
    character?: {
      name: string;
    };
  }>;
  scene_props?: Array<{
    prop?: {
      name: string;
    };
    quantity?: number;
  }>;
}

interface ExportOptions {
  projectTitle?: string;
  includeDetails?: boolean;
  sortMethod?: string;
}

export function exportStripboardToPDF(scenes: Scene[], options: ExportOptions = {}) {
  const { projectTitle = 'Production Stripboard', includeDetails = true, sortMethod = 'scene_number' } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Add header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(projectTitle, 148, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 148, 22, { align: 'center' });

  // Draw a line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 25, 283, 25);

  // Prepare scene data for table
  const tableData = scenes.map((scene) => {
    const sceneType = scene.scene_type === 'int' ? 'INT' : scene.scene_type === 'ext' ? 'EXT' : 'INT/EXT';
    const timeOfDay = (scene.time_of_day || 'DAY').toUpperCase();
    const status = (scene.status || 'Not Scheduled').replace('_', ' ').toUpperCase();
    const shootDate = scene.shoot_date ? new Date(scene.shoot_date).toLocaleDateString() : '-';
    
    const cast = scene.scene_characters && scene.scene_characters.length > 0
      ? scene.scene_characters.map(sc => sc.character?.name || '').filter(n => n).join(', ')
      : '-';

    return [
      scene.scene_number,
      scene.scene_name || `Scene ${scene.scene_number}`,
      scene.location_name || '-',
      sceneType,
      timeOfDay,
      scene.page_count?.toFixed(1) || '-',
      scene.estimated_duration || '-',
      status,
      shootDate,
      ...(includeDetails ? [cast] : []),
    ];
  });

  // Create table
  const headers = [
    'Scene #',
    'Scene Name',
    'Location',
    'Type',
    'Time',
    'Pages',
    'Duration (min)',
    'Status',
    'Shoot Date',
  ];

  if (includeDetails) {
    headers.push('Cast');
  }

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // Scene #
      1: { halign: 'left', cellWidth: 'auto' }, // Scene Name
      2: { halign: 'left', cellWidth: 'auto' }, // Location
      3: { halign: 'center', cellWidth: 18 }, // Type
      4: { halign: 'center', cellWidth: 20 }, // Time
      5: { halign: 'center', cellWidth: 18 }, // Pages
      6: { halign: 'center', cellWidth: 25 }, // Duration
      7: { halign: 'center', cellWidth: 30 }, // Status
      8: { halign: 'center', cellWidth: 25 }, // Shoot Date
      ...(includeDetails ? { 9: { halign: 'left', cellWidth: 'auto' } } : {}), // Cast
    },
    didDrawCell: (data) => {
      // Color code scene types
      if (data.column.index === 3 && data.section === 'body') {
        const sceneType = data.cell.text[0];
        let fillColor: [number, number, number] = [255, 255, 255];
        
        if (sceneType === 'INT') {
          fillColor = [220, 252, 231]; // Green tint
        } else if (sceneType === 'EXT') {
          fillColor = [254, 240, 217]; // Orange tint
        } else if (sceneType === 'INT/EXT') {
          fillColor = [240, 230, 247]; // Purple tint
        }
        
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(data.cell.text, data.cell.x + data.cell.padding('left'), data.cell.y + data.cell.height / 2, {
          baseline: 'middle',
        });
      }
    },
  });

  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 148, 200, { align: 'center' });
  }

  // Add summary statistics at the end
  if (includeDetails) {
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    
    if (finalY < 170) { // If there's space on the last page
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Production Summary', 14, finalY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const totalScenes = scenes.length;
      const totalPages = scenes.reduce((sum, s) => sum + (s.page_count || 0), 0);
      const totalDuration = scenes.reduce((sum, s) => sum + (s.estimated_duration || 0), 0);
      const completedScenes = scenes.filter(s => s.status === 'completed').length;
      const scheduledScenes = scenes.filter(s => s.status === 'scheduled').length;
      
      doc.text(`Total Scenes: ${totalScenes}`, 14, finalY + 22);
      doc.text(`Total Pages: ${totalPages.toFixed(1)}`, 14, finalY + 28);
      doc.text(`Estimated Duration: ${totalDuration} minutes (${(totalDuration / 60).toFixed(1)} hours)`, 14, finalY + 34);
      doc.text(`Completed: ${completedScenes} | Scheduled: ${scheduledScenes} | Remaining: ${totalScenes - completedScenes - scheduledScenes}`, 14, finalY + 40);
    }
  }

  // Map sort methods to readable names
  const sortMethodNames: Record<string, string> = {
    scene_number: 'scene-order',
    location: 'by-location',
    scene_type: 'by-type',
    time: 'by-time',
    cast_count: 'by-cast-size',
    cast_appearances: 'by-cast-member'
  };

  // Save the PDF with sort method in filename
  const sortName = sortMethodNames[sortMethod] || 'scene-order';
  const projectName = projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const filename = `${projectName}-${sortName}-stripboard-${date}.pdf`;
  
  doc.save(filename);
}
