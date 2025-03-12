import { FC, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { useAuth } from '@utils/auth';

const TeamsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TeamCard = styled.div`
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const InviteForm = styled.form`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const Teams: FC = () => {
  const { user, token } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/api/teams', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        setTeams(response.data.data || []);
      });
    }
  }, [user, token]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    try {
      const response = await axios.post(
        'http://localhost:5000/api/teams/create',
        { name: newTeamName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeams([...teams, response.data.team]);
      setNewTeamName('');
    } catch (error) {
      console.error('Failed to create team', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail) return;
    try {
      await axios.post(
        'http://localhost:5000/api/teams/invite',
        { teamId: selectedTeam, memberEmail: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to invite member', error);
    }
  };

  return (
    <TeamsContainer>
      <h2>Your Teams</h2>
      {teams.map((team) => (
        <TeamCard key={team._id}>
          {team.name} (Owner: {team.owner === user?.id ? 'You' : 'Someone else'})
          <button onClick={() => setSelectedTeam(team._id)}>Select</button>
        </TeamCard>
      ))}
      <form onSubmit={handleCreateTeam}>
        <Input
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New Team Name"
        />
        <Button type="submit">Create Team</Button>
      </form>
      {selectedTeam && (
        <InviteForm onSubmit={handleInvite}>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by Email"
          />
          <Button type="submit">Invite</Button>
        </InviteForm>
      )}
    </TeamsContainer>
  );
};

export default Teams;