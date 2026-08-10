import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Scene {
  id: string;
  scene_number: string;
  scene_name?: string;
  location_name?: string;
  shoot_date?: string;
  scene_characters?: Array<{
    character?: {
      id: string;
      name: string;
      actor_name?: string;
      actor_phone?: string;
      actor_email?: string;
    };
  }>;
}

interface ActorCallInfo {
  actorName: string;
  characterName: string;
  phone?: string;
  email?: string;
  scenes: string[];
}

interface DayCall {
  date: string;
  actors: ActorCallInfo[];
  scenes: Array<{
    sceneNumber: string;
    sceneName?: string;
    location?: string;
  }>;
}

export function generateCallSheet(scenes: Scene[], projectTitle: string) {
  // Group scenes by shoot date
  const scenesByDate = new Map<string, Scene[]>();
  
  scenes.forEach(scene => {
    if (scene.shoot_date) {
      const dateKey = scene.shoot_date;
      if (!scenesByDate.has(dateKey)) {
        scenesByDate.set(dateKey, []);
      }
      scenesByDate.get(dateKey)!.push(scene);
    }
  });

  // Build call sheet data organized by date
  const dayCalls: DayCall[] = [];
  
  scenesByDate.forEach((scenesOnDate, date) => {
    const actorMap = new Map<string, ActorCallInfo>();
    
    // Collect all actors needed on this date
    scenesOnDate.forEach(scene => {
      scene.scene_characters?.forEach(sc => {
        if (sc.character) {
          const actorKey = sc.character.actor_name || sc.character.name;
          
          if (!actorMap.has(actorKey)) {
            actorMap.set(actorKey, {
              actorName: sc.character.actor_name || 'Not Cast',
              characterName: sc.character.name,
              phone: sc.character.actor_phone,
              email: sc.character.actor_email,
              scenes: []
            });
          }
          
          actorMap.get(actorKey)!.scenes.push(scene.scene_number);
        }
      });
    });

    dayCalls.push({
      date,
      actors: Array.from(actorMap.values()).sort((a, b) => 
        a.actorName.localeCompare(b.actorName)
      ),
      scenes: scenesOnDate.map(s => ({
        sceneNumber: s.scene_number,
        sceneName: s.scene_name,
        location: s.location_name
      })).sort((a, b) => a.sceneNumber.localeCompare(b.sceneNumber))
    });
  });

  // Sort by date
  dayCalls.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTION CALL SHEET', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.text(projectTitle, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // For each shooting day
  dayCalls.forEach((dayCall, index) => {
    if (index > 0) {
      doc.addPage();
      yPos = 20;
    }

    // Date header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const formattedDate = new Date(dayCall.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Shoot Date: ${formattedDate}`, 14, yPos);
    yPos += 12;

    // Scenes for this day
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Scenes Scheduled:', 14, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    dayCall.scenes.forEach(scene => {
      const sceneText = `Scene ${scene.sceneNumber}${scene.sceneName ? ': ' + scene.sceneName : ''}${scene.location ? ' - ' + scene.location : ''}`;
      doc.text(sceneText, 20, yPos);
      yPos += 5;
    });
    
    yPos += 8;

    // Actor call list table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cast & Contact Information:', 14, yPos);
    yPos += 8;

    const actorTableData = dayCall.actors.map(actor => [
      actor.actorName,
      actor.characterName,
      actor.scenes.join(', '),
      actor.phone || 'N/A',
      actor.email || 'N/A'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Actor Name', 'Character', 'Scenes', 'Phone', 'Email']],
      body: actorTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 50 }
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Important notes
    if (yPos + 30 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Notes:', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('• Call time and location details to be confirmed', 14, yPos);
    yPos += 5;
    doc.text('• Please confirm your availability as soon as possible', 14, yPos);
    yPos += 5;
    doc.text('• Contact production if you have any scheduling conflicts', 14, yPos);
  });

  // Save the PDF
  const fileName = `CallSheet_${projectTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
