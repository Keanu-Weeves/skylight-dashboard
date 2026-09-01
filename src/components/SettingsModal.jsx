import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './SettingsModal.css';

export default function SettingsModal({ session, isOnboarding, onClose, onComplete }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hubId, setHubId] = useState(null);

    //Form state
    const [familyName, setFamilyName] = useState('');
    const [location, setLocation] = useState('Atlanta, GA');
    const [members, setMembers] = useState([
        { id: Date.now(), name: '', avatar: '👤', color: '#4a82a6' }
    ]);

    useEffect(() => {
        async function loadHubData() {
            const { data: hub } = await supabase
            .from('hubs')
            .select('*')
            .eq('owner_id', session.user.id)
            .single();

            if (hub) {
                setHubId(hub.id);
                setFamilyName(hub.family_name);
                setLocation(hub.weather_location || 'Atlanta, GA');

                const { data: hubMembers } = await supabase
                    .from('hub_members')
                    .select('*')
                    .eq('hub_id', hub.id);

                if (hubMembers && hubMembers.length > 0) {
                    setMembers(hubMembers);
                }
            }
            setLoading(false);
        }
        loadHubData();
    }, [session.user.id]);

    const handleAddMember = () => {
        setMembers([ ...members, { id: Date.now(), name: '', avatar: '👤', color: '#cccccc' }]);
    };

    const handleRemoveMember = (idToRemove) => {
        setMembers(members.filter(m => m.id !== idToRemove));
    };

    const updateMember = (id, field, value) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSave = async () => {
        setSaving(true);
        let currentHubId = hubId;

        try {
            if (!currentHubId) {
                const { data: newHub, error: hubError } = await supabase
                    .from('hubs')
                    .insert([{ owner_id: session.user.id, family_name: familyName, weather_location: location }])
                    .select()
                    .single();
                if (hubError) throw hubError;
                currentHubId = newHub.id;
                setHubId(currentHubId);
            } else {
                await supabase
                  .from('hubs')
                  .update({ family_name: familyName, weather_location: location })
                  .eq('id', currentHubId);
            }

            await supabase.from('hub_members').delete().eq('hub_id', currentHubId);

            const membersToInsert = members.map(m => ({
                hub_id: currentHubId,
                name: m.name,
                color: m.color,
                avatar: m.avatar
            }));

            await supabase.from('hub_members').insert(membersToInsert);

            setSaving(false);
            onComplete();
        } catch (error) {
            console.error('Error saving to hub:', error.message);
            setSaving(false);
        }
    };

    if (loading) return <div className="settings-overlay">Loading settings...</div>;

    return (
        <div className="settings-overlay">
            <div className="settings-modal glass-card">
                {!isOnboarding && (
                    <button className="close-btn" onClick={onClose}>✕</button>
                )}

                <h2>{isOnboarding ? 'Welcome to HearthOS' : 'HearthOS Settings'}</h2>
                <p>{isOnboarding ? "Let's set up your family hub." : "Manage your family hub."}</p>

                <div className="settings-section">
                    <label>Family Name (e.g., The Smiths)</label>
                    <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="Family Name"
                    />
                </div>

                <div className="settings-section">
                    <label>Weather Location (City, State, or Zip)</label>
                    <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Atlanta, GA"
                    />
                </div>

                <div className="settings-section members-section">
                    <label>Family Members</label>
                    {members.map((member, index) => (
                        <div key={member.id} className="member-row">
                            <input
                            type="text"
                            className="member-avatar-input"
                            value={member.avatar}
                            onChange={(e) => updateMember(member.id, 'avatar', e.target.value)}
                            maxLength={2}
                            />
                            <input
                            type="text"
                            className="member-name-input"
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            placeholder="Name"
                            />
                            <input
                            type="color"
                            className="member-color-input"
                            value={member.color}
                            onChange={(e) => updateMember(member.id, 'color', e.target.value)}
                            />
                            <button className="remove-member-btn" onClick={() => handleRemoveMember(member.id)}>✕</button>
                        </div>
                    ))}
                    <button className="add-member-btn" onClick={handleAddMember}>+ Add Member</button>
                </div>

                <button className="save-btn" onClick={handleSave} disabled={!familyName || saving}>
                    {saving ? 'Saving...' : (isOnboarding ? 'Launch Hub': 'Save Changes')}
                </button>
            </div>
        </div>
    );
}