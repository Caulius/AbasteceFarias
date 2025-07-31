import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Fuel, Car, User, FileSpreadsheet } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  fuelRecords: FuelRecord[];
  responsibles: Responsible[];
  vehicles: Vehicle[];
}

const Reports: React.FC<ReportsProps> = ({ fuelRecords, responsibles, vehicles }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const getFilteredRecords = () => {
    if (reportType === 'daily') {
      return fuelRecords.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === selectedDate;
      });
    } else {
      return fuelRecords.filter(record => {
        const recordMonth = new Date(record.date).toISOString().slice(0, 7);
        return recordMonth === selectedMonth;
      });
    }
  };

  const filteredRecords = getFilteredRecords();

  const generatePDFReport = () => {
    const records = filteredRecords;
    const period = reportType === 'daily' 
      ? new Date(selectedDate).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
      : new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long' 
        });

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text(`RELATÓRIO DE ABASTECIMENTO - ${period.toUpperCase()}`, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} às ${new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, 20, 30);
    
    // Resumo
    const totalDieselDaily = records.reduce((sum, r) => {
      const dailyStart = r.dieselDailyStart || 0;
      const dailyEnd = r.dieselDailyEnd || 0;
      return sum + Math.max(dailyStart, dailyEnd);
    }, 0);
    const totalArlaDaily = records.reduce((sum, r) => {
      const dailyStart = r.arlaDailyStart || 0;
      const dailyEnd = r.arlaDailyEnd || 0;
      return sum + Math.max(dailyStart, dailyEnd);
    }, 0);
    const totalDieselRefueled = records.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
    const totalArlaRefueled = records.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
    const avgConsumption = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.average || 0), 0) / records.length 
      : 0;

    doc.text(`Total de Abastecimentos: ${records.length}`, 20, 45);
    doc.text(`Último Nível DIESEL: ${totalDieselDaily.toFixed(2)} L`, 20, 52);
    doc.text(`Último Nível ARLA: ${totalArlaDaily.toFixed(2)} L`, 20, 59);
    doc.text(`Total DIESEL Abastecido: ${totalDieselRefueled.toFixed(2)} L`, 20, 66);
    doc.text(`Total ARLA Abastecido: ${totalArlaRefueled.toFixed(2)} L`, 20, 73);
    doc.text(`Média de Consumo: ${avgConsumption.toFixed(2)} km/l`, 20, 80);

    if (records.length > 0) {
      // Tabela de dados
      const tableData = records.map(record => {
        const responsible = responsibles.find(r => r.id === record.responsibleId);
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        
        return [
          new Date(record.date).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          }) + ' ' + new Date(record.date).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          responsible?.name || 'N/A',
          `${vehicle?.plate} - ${vehicle?.model}`,
          record.fuelTypes.join(', '),
          record.status,
          record.dieselDailyStart || record.dieselDailyEnd ? 
            `${record.dieselDailyStart || 0}L → ${record.dieselDailyEnd || 0}L` : '-',
          record.arlaDailyStart || record.arlaDailyEnd ? 
            `${record.arlaDailyStart || 0}L → ${record.arlaDailyEnd || 0}L` : '-',
          `D:${record.dieselTotalRefueled || 0}L A:${record.arlaTotalRefueled || 0}L`,
          record.vehicleKm || '-',
          record.average ? `${record.average} km/l` : '-',
          record.averagePanel ? `${record.averagePanel} km/l` : '-',
          record.observations || '-'
        ];
      });

      autoTable(doc, {
        head: [['Data/Hora', 'Responsável', 'Veículo', 'Tipos', 'Status', 'DIESEL Diário', 'ARLA Diário', 'Abastecido', 'KM', 'Média', 'Média Painel', 'Observações']],
        body: tableData,
        startY: 87,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] }
      });
    }

    doc.save(`relatorio-abastecimento-${reportType}-${reportType === 'daily' ? selectedDate : selectedMonth}.pdf`);
  };

  const generateExcelReport = () => {
    const records = filteredRecords;
    const period = reportType === 'daily' 
      ? (() => {
          const [year, month, day] = selectedDate.split('-');
          return `${day}/${month}/${year}`;
        })()
      : (() => {
          const [year, month] = selectedMonth.split('-');
          const monthNames = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
          ];
          return `${monthNames[parseInt(month) - 1]} de ${year}`;
        })();

    // Dados do resumo
    const totalDieselDaily = records.reduce((sum, r) => {
      const dailyStart = r.dieselDailyStart || 0;
      const dailyEnd = r.dieselDailyEnd || 0;
      return sum + Math.max(dailyStart, dailyEnd);
    }, 0);
    const totalArlaDaily = records.reduce((sum, r) => {
      const dailyStart = r.arlaDailyStart || 0;
      const dailyEnd = r.arlaDailyEnd || 0;
      return sum + Math.max(dailyStart, dailyEnd);
    }, 0);
    const totalDieselRefueled = records.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
    const totalArlaRefueled = records.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
    const avgConsumption = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.average || 0), 0) / records.length 
      : 0;

    // Planilha de resumo
    const summaryData = [
      ['RELATÓRIO DE ABASTECIMENTO', period],
      ['Gerado em', (() => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
      })()],
      [''],
      ['RESUMO GERAL'],
      ['Total de Abastecimentos', records.length],
      ['Último Nível DIESEL (L)', totalDieselDaily.toFixed(2)],
      ['Último Nível ARLA (L)', totalArlaDaily.toFixed(2)],
      ['Total DIESEL Abastecido (L)', totalDieselRefueled.toFixed(2)],
      ['Total ARLA Abastecido (L)', totalArlaRefueled.toFixed(2)],
      ['Média de Consumo (km/l)', avgConsumption.toFixed(2)]
    ];

    // Dados detalhados - Cabeçalho expandido
    const detailsData = [
      [
        'Data', 'Hora', 'Responsável', 'Telefone', 'Veículo', 'Placa', 'Modelo',
        'Tipos Combustível', 'Status',
        'DIESEL - Hodômetro Inicial', 'DIESEL - Hodômetro Final',
        'DIESEL - Nível Inicial', 'DIESEL - Nível Final',
        'DIESEL - Total Início Dia (L)', 'DIESEL - Total Final Dia (L)',
        'DIESEL - Total Abastecido (L)',
        'ARLA - Hodômetro Inicial', 'ARLA - Hodômetro Final',
        'ARLA - Nível Inicial', 'ARLA - Nível Final',
        'ARLA - Total Início Dia (L)', 'ARLA - Total Final Dia (L)',
        'ARLA - Total Abastecido (L)',
        'KM do Veículo', 'Média Consumo (km/l)', 'Média Painel (km/l)', 'Observações'
      ]
    ];

    records.forEach(record => {
      const responsible = responsibles.find(r => r.id === record.responsibleId);
      const vehicle = vehicles.find(v => v.id === record.vehicleId);
      
      detailsData.push([
        // Data e hora
        (() => {
          const date = new Date(record.date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        })(),
        (() => {
          const date = new Date(record.date);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        })(),
        // Responsável
        responsible?.name || '',
        responsible?.phone || '',
        // Veículo
        vehicle?.plate || '',
        vehicle?.model || '',
        vehicle?.model || '',
        // Tipos de combustível
        record.fuelTypes.join(', '),
        record.status,
        // DIESEL - Dados completos
        record.dieselOdometerStart || '',
        record.dieselOdometerEnd || '',
        record.dieselLevelStart || '',
        record.dieselLevelEnd || '',
        record.dieselDailyStart || '',
        record.dieselDailyEnd || '',
        record.dieselTotalRefueled || '',
        // ARLA - Dados completos
        record.arlaOdometerStart || '',
        record.arlaOdometerEnd || '',
        record.arlaLevelStart || '',
        record.arlaLevelEnd || '',
        record.arlaDailyStart || '',
        record.arlaDailyEnd || '',
        record.arlaTotalRefueled || '',
        // Dados gerais
        record.vehicleKm || '',
        record.average || '',
        record.averagePanel || '',
        record.observations || ''
      ]);
    });

    // Dados por veículo - Análise consolidada
    const vehicleAnalysisData = [
      ['ANÁLISE POR VEÍCULO'],
      [''],
      ['Veículo', 'Placa', 'Modelo', 'Total Abastecimentos', 'DIESEL Total (L)', 'ARLA Total (L)', 'Média Consumo (km/l)', 'Último KM']
    ];

    // Agrupar dados por veículo
    const vehicleStats = vehicles.map(vehicle => {
      const vehicleRecords = records.filter(r => r.vehicleId === vehicle.id);
      const totalDieselRefueled = vehicleRecords.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
      const totalArlaRefueled = vehicleRecords.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
      const avgConsumption = vehicleRecords.length > 0 
        ? vehicleRecords.reduce((sum, r) => sum + (r.average || 0), 0) / vehicleRecords.length 
        : 0;
      const lastKm = vehicleRecords
        .filter(r => r.vehicleKm)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.vehicleKm || '';

      return [
        vehicle.plate,
        vehicle.plate,
        vehicle.model,
        vehicleRecords.length,
        totalDieselRefueled.toFixed(2),
        totalArlaRefueled.toFixed(2),
        avgConsumption > 0 ? avgConsumption.toFixed(2) : '',
        lastKm
      ];
    }).filter(stats => stats[3] > 0); // Apenas veículos com abastecimentos

    vehicleAnalysisData.push(...vehicleStats);

    // Dados por responsável - Análise consolidada
    const responsibleAnalysisData = [
      ['ANÁLISE POR RESPONSÁVEL'],
      [''],
      ['Responsável', 'Telefone', 'Total Abastecimentos', 'DIESEL Total (L)', 'ARLA Total (L)', 'Veículos Atendidos']
    ];

    // Agrupar dados por responsável
    const responsibleStats = responsibles.map(responsible => {
      const responsibleRecords = records.filter(r => r.responsibleId === responsible.id);
      const totalDieselRefueled = responsibleRecords.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
      const totalArlaRefueled = responsibleRecords.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
      const uniqueVehicles = [...new Set(responsibleRecords.map(r => r.vehicleId))];
      const vehicleNames = uniqueVehicles.map(vId => {
        const vehicle = vehicles.find(v => v.id === vId);
        return vehicle ? vehicle.plate : '';
      }).filter(Boolean).join(', ');

      return [
        responsible.name,
        responsible.phone || '',
        responsibleRecords.length,
        totalDieselRefueled.toFixed(2),
        totalArlaRefueled.toFixed(2),
        vehicleNames
      ];
    }).filter(stats => stats[2] > 0); // Apenas responsáveis com abastecimentos

    responsibleAnalysisData.push(...responsibleStats);

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Adicionar planilha de resumo
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
    
    // Adicionar planilha de detalhes completos
    const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(wb, detailsWs, 'Detalhes Completos');

    // Adicionar planilha de análise por veículo
    if (vehicleStats.length > 0) {
      const vehicleWs = XLSX.utils.aoa_to_sheet(vehicleAnalysisData);
      XLSX.utils.book_append_sheet(wb, vehicleWs, 'Análise por Veículo');
    }

    // Adicionar planilha de análise por responsável
    if (responsibleStats.length > 0) {
      const responsibleWs = XLSX.utils.aoa_to_sheet(responsibleAnalysisData);
      XLSX.utils.book_append_sheet(wb, responsibleWs, 'Análise por Responsável');
    }

    // Salvar arquivo
    XLSX.writeFile(wb, `relatorio-abastecimento-${reportType}-${reportType === 'daily' ? selectedDate : selectedMonth}.xlsx`);
  };

  const generateReport = () => {
    const records = filteredRecords;
    const period = reportType === 'daily' 
      ? (() => {
          const [year, month, day] = selectedDate.split('-');
          return `${day}/${month}/${year}`;
        })()
      : (() => {
          const [year, month] = selectedMonth.split('-');
          const monthNames = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
          ];
          return `${monthNames[parseInt(month) - 1]} de ${year}`;
        })();

    let reportContent = `RELATÓRIO DE ABASTECIMENTO - ${period.toUpperCase()}\n`;
    reportContent += `Gerado em: ${(() => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    })()}\n`;
    reportContent += `${'='.repeat(60)}\n\n`;

    if (records.length === 0) {
      reportContent += 'Nenhum abastecimento encontrado para o período selecionado.\n';
    } else {
      // Resumo
      const totalDieselDaily = records.reduce((sum, r) => {
        const dailyStart = r.dieselDailyStart || 0;
        const dailyEnd = r.dieselDailyEnd || 0;
        return sum + Math.max(dailyStart, dailyEnd);
      }, 0);
      const totalArlaDaily = records.reduce((sum, r) => {
        const dailyStart = r.arlaDailyStart || 0;
        const dailyEnd = r.arlaDailyEnd || 0;
        return sum + Math.max(dailyStart, dailyEnd);
      }, 0);
      const totalDieselRefueled = records.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
      const totalArlaRefueled = records.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
      const avgConsumption = records.length > 0 
        ? records.reduce((sum, r) => sum + (r.average || 0), 0) / records.length 
        : 0;

      reportContent += `RESUMO GERAL:\n`;
      reportContent += `Total de Abastecimentos: ${records.length}\n`;
      reportContent += `Último Nível DIESEL: ${totalDieselDaily.toFixed(2)} L\n`;
      reportContent += `Último Nível ARLA: ${totalArlaDaily.toFixed(2)} L\n`;
      reportContent += `Total DIESEL Abastecido: ${totalDieselRefueled.toFixed(2)} L\n`;
      reportContent += `Total ARLA Abastecido: ${totalArlaRefueled.toFixed(2)} L\n`;
      reportContent += `Média de Consumo: ${avgConsumption.toFixed(2)} km/l\n\n`;

      reportContent += `DETALHAMENTO DOS ABASTECIMENTOS:\n`;
      reportContent += `${'-'.repeat(60)}\n`;

      records.forEach((record, index) => {
        const responsible = responsibles.find(r => r.id === record.responsibleId);
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        
        reportContent += `${index + 1}. Data: ${new Date(record.date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })} às ${new Date(record.date).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}\n`;
        reportContent += `${index + 1}. Data: ${(() => {
          const date = new Date(record.date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} às ${hours}:${minutes}`;
        })()}\n`;
        reportContent += `   Responsável: ${responsible?.name || 'N/A'}\n`;
        if (responsible?.phone) {
          reportContent += `   Telefone: ${responsible.phone}\n`;
        }
        reportContent += `   Veículo: ${vehicle?.plate} - ${vehicle?.model}\n`;
        reportContent += `   Tipos: ${record.fuelTypes.join(', ')}\n`;
        
        if (record.fuelTypes.includes('DIESEL')) {
          reportContent += `   DIESEL:\n`;
          if (record.dieselOdometerStart) reportContent += `     Hodômetro Inicial: ${record.dieselOdometerStart}\n`;
          if (record.dieselOdometerEnd) reportContent += `     Hodômetro Final: ${record.dieselOdometerEnd}\n`;
          if (record.dieselLevelStart) reportContent += `     Nível Inicial: ${record.dieselLevelStart}\n`;
          if (record.dieselLevelEnd) reportContent += `     Nível Final: ${record.dieselLevelEnd}\n`;
          if (record.dieselDailyStart) reportContent += `     Total Início do Dia: ${record.dieselDailyStart} L\n`;
          if (record.dieselDailyEnd) reportContent += `     Total Final do Dia: ${record.dieselDailyEnd} L\n`;
          if (record.dieselTotalRefueled) reportContent += `     Total Abastecido: ${record.dieselTotalRefueled} L\n`;
        }
        
        if (record.fuelTypes.includes('ARLA')) {
          reportContent += `   ARLA:\n`;
          if (record.arlaOdometerStart) reportContent += `     Hodômetro Inicial: ${record.arlaOdometerStart}\n`;
          if (record.arlaOdometerEnd) reportContent += `     Hodômetro Final: ${record.arlaOdometerEnd}\n`;
          if (record.arlaLevelStart) reportContent += `     Nível Inicial: ${record.arlaLevelStart}\n`;
          if (record.arlaLevelEnd) reportContent += `     Nível Final: ${record.arlaLevelEnd}\n`;
          if (record.arlaDailyStart) reportContent += `     Total Início do Dia: ${record.arlaDailyStart} L\n`;
          if (record.arlaDailyEnd) reportContent += `     Total Final do Dia: ${record.arlaDailyEnd} L\n`;
          if (record.arlaTotalRefueled) reportContent += `     Total Abastecido: ${record.arlaTotalRefueled} L\n`;
        }
        
        if (record.vehicleKm) reportContent += `   KM do Veículo: ${record.vehicleKm}\n`;
        if (record.average) reportContent += `   Média: ${record.average} km/l\n`;
        if (record.averagePanel) reportContent += `   Média Painel: ${record.averagePanel} km/l\n`;
        if (record.observations) reportContent += `   Observações: ${record.observations}\n`;
        reportContent += `\n`;
      });
    }

    // Download do arquivo
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-abastecimento-${reportType}-${reportType === 'daily' ? selectedDate : selectedMonth}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReportStats = () => {
    const records = filteredRecords;
    return {
      totalRecords: records.length,
      totalDieselDaily: records.reduce((sum, r) => {
        const dailyStart = r.dieselDailyStart || 0;
        const dailyEnd = r.dieselDailyEnd || 0;
        return sum + Math.max(dailyStart, dailyEnd);
      }, 0),
      totalArlaDaily: records.reduce((sum, r) => {
        const dailyStart = r.arlaDailyStart || 0;
        const dailyEnd = r.arlaDailyEnd || 0;
        return sum + Math.max(dailyStart, dailyEnd);
      }, 0),
      totalDieselRefueled: records.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0),
      totalArlaRefueled: records.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0),
      avgConsumption: records.length > 0 
        ? records.reduce((sum, r) => sum + (r.average || 0), 0) / records.length 
        : 0
    };
  };

  const stats = getReportStats();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros do Relatório
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="daily">Relatório Diário</option>
              <option value="monthly">Relatório Mensal</option>
            </select>
          </div>
          
          {reportType === 'daily' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mês/Ano
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
              />
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={generatePDFReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateExcelReport}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Preview do Relatório */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Preview do Relatório
        </h3>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-blue-400 font-medium">Abastecimentos</p>
                <p className="text-xl font-bold text-white">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-600/30">
            <div className="flex items-center">
              <Fuel className="h-5 w-5 text-orange-400 mr-2" />
              <div>
                <p className="text-sm text-orange-400 font-medium">DIESEL Diário</p>
                <p className="text-xl font-bold text-white">{stats.totalDieselDaily.toFixed(1)}L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
            <div className="flex items-center">
              <Fuel className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <p className="text-sm text-green-400 font-medium">ARLA Diário</p>
                <p className="text-xl font-bold text-white">{stats.totalArlaDaily.toFixed(1)}L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30">
            <div className="flex items-center">
              <Fuel className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-sm text-yellow-400 font-medium">DIESEL Abastecido</p>
                <p className="text-xl font-bold text-white">{stats.totalDieselRefueled.toFixed(1)}L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-teal-900/20 p-4 rounded-lg border border-teal-600/30">
            <div className="flex items-center">
              <Fuel className="h-5 w-5 text-teal-400 mr-2" />
              <div>
                <p className="text-sm text-teal-400 font-medium">ARLA Abastecido</p>
                <p className="text-xl font-bold text-white">{stats.totalArlaRefueled.toFixed(1)}L</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-purple-400 mr-2" />
              <div>
                <p className="text-sm text-purple-400 font-medium">Média</p>
                <p className="text-xl font-bold text-white">{stats.avgConsumption.toFixed(2)} km/l</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Registros */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              Nenhum registro encontrado
            </h4>
            <p className="text-gray-400">
              Não há abastecimentos para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-white">
              Registros do Período ({filteredRecords.length} abastecimentos)
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRecords.map((record) => {
                const responsible = responsibles.find(r => r.id === record.responsibleId);
                const vehicle = vehicles.find(v => v.id === record.vehicleId);
                
                return (
                  <div key={record.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-white">
                            {vehicle?.plate} - {vehicle?.model}
                          </span>
                          <div className="flex space-x-1">
                            {record.fuelTypes.map(type => (
                              <span
                                key={type}
                                className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                                  type === 'DIESEL' 
                                    ? 'bg-orange-600' 
                                    : 'bg-green-600'
                                }`}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {responsible?.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {(() => {
                              const date = new Date(record.date);
                              const day = String(date.getDate()).padStart(2, '0');
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const year = date.getFullYear();
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${day}/${month}/${year} às ${hours}:${minutes}`;
                            })()}
                          </div>
                        </div>
                        {record.observations && (
                          <p className="text-sm text-gray-300 mt-2 italic">
                            "{record.observations}"
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {(record.dieselDailyStart || record.dieselDailyEnd) && (
                          <p className="text-sm text-orange-400 font-medium">
                            DIESEL: {record.dieselDailyStart && `${record.dieselDailyStart}L`}
                            {record.dieselDailyStart && record.dieselDailyEnd && ' → '}
                            {record.dieselDailyEnd && `${record.dieselDailyEnd}L`}
                          </p>
                        )}
                        {record.dieselTotalRefueled && (
                          <div>
                            <span className="text-gray-400">Abastecido:</span>
                            <span className="text-orange-400 font-medium ml-1">{record.dieselTotalRefueled}L</span>
                          </div>
                        )}
                        {(record.arlaDailyStart || record.arlaDailyEnd) && (
                          <p className="text-sm text-green-400 font-medium">
                            ARLA: {record.arlaDailyStart && `${record.arlaDailyStart}L`}
                            {record.arlaDailyStart && record.arlaDailyEnd && ' → '}
                            {record.arlaDailyEnd && `${record.arlaDailyEnd}L`}
                          </p>
                        )}
                        {record.average && (
                          <p className="text-sm text-purple-400 font-medium">
                            {record.average} km/l
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
