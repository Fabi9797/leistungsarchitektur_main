import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import StatsCards from '@/components/sales/StatsCards';
import SalesCallTable from '@/components/sales/SalesCallTable';
import LeadSelector from '@/components/sales/LeadSelector';

export default function SalesCockpit() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    newLeads: 0,
    activeCalls: 0,
    closedThisWeek: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [callsData, leadsData] = await Promise.all([
        base44.entities.SalesCall.list(),
        base44.entities.Lead.list()
      ]);

      setCalls(callsData);
      setLeads(leadsData);

      // Calculate stats
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newLeads = leadsData.filter(
        l => new Date(l.created_date) > weekAgo
      ).length;

      const activeCalls = callsData.filter(c => c.status === 'Aktiv').length;

      const closedThisWeek = callsData.filter(
        c => c.status === 'Abgeschlossen' &&
             c.call_date &&
             new Date(c.call_date) > weekAgo
      ).length;

      const conversions = callsData.filter(c => c.ergebnis === 'Abschluss').length;
      const conversionRate = callsData.length > 0 ? Math.round((conversions / callsData.length) * 100) : 0;

      setStats({
        newLeads,
        activeCalls,
        closedThisWeek,
        conversionRate
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSelectLead = async (lead) => {
    try {
      const newCall = await base44.entities.SalesCall.create({
        lead_id: lead.id,
        lead_name: lead.name,
        lead_email: lead.email,
        lead_phone: lead.phone,
        lead_analyse_json: lead.analyse_answers,
        status: 'Vorbereitung',
        current_step: 1,
        call_date: new Date().toISOString().split('T')[0],
        step_notes_json: JSON.stringify({})
      });

      navigate(`/sales-wizard/${newCall.id}`);
    } catch (error) {
      console.error('Error creating sales call:', error);
    }
  };

  const handleRowClick = (call) => {
    navigate(`/sales-wizard/${call.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Cockpit</h1>
            <p className="text-gray-600 mt-1">Verwalte deine Verkaufsgespräche</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            style={{ backgroundColor: '#1B365D' }}
            className="text-white flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Neues Verkaufsgespräch
          </Button>
        </div>

        <StatsCards stats={stats} />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alle Gespräche</h2>
          <SalesCallTable calls={calls} onRowClick={handleRowClick} />
        </div>
      </div>

      <LeadSelector
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leads={leads}
        onSelect={handleSelectLead}
      />
    </div>
  );
}