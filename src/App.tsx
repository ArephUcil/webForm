import { useState, ChangeEvent } from 'react';

type FamilyMember = {
  id: number;
  noKTP: string;
  name: string;
  birthday: string;
  statusInFamily: string;
  marriageStatus: string;
  gender: string;
};

const defaultMember = (id: number): FamilyMember => ({
  id,
  noKTP: '',
  name: '',
  birthday: '',
  statusInFamily: '',
  marriageStatus: '',
  gender: ''
});

type SubmitPayload = {
  noKK: string;
  kkFileName: string | null;
  kkFileType: string | null;
  familyMembers: Omit<FamilyMember, 'id'>[];
};

function App() {
  const [noKK, setNoKK] = useState('');
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([defaultMember(1)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleAddMember = () => {
    setFamilyMembers((current) => [...current, defaultMember(current.length + 1)]);
  };

  const handleRemoveMember = (id: number) => {
    setFamilyMembers((current) => current.filter((member) => member.id !== id));
  };

  const handleMemberChange = (id: number, field: keyof FamilyMember, value: string) => {
    setFamilyMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setKkFile(file);
  };

  const handleSubmit = async () => {
    const payload: SubmitPayload = {
      noKK,
      kkFileName: kkFile?.name ?? null,
      kkFileType: kkFile?.type ?? null,
      familyMembers: familyMembers.map(({ id, ...rest }) => rest),
    };

    setIsSubmitting(true);
    setStatusMessage('Submitting data to Google Sheets...');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody?.message || 'Failed to submit data');
      }

      setStatusMessage('Data uploaded to Google Sheets successfully.');
      setNoKK('');
      setKkFile(null);
      setFamilyMembers([defaultMember(1)]);
    } catch (error: any) {
      setStatusMessage(`Upload failed: ${error?.message ?? 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <header>
        <h1>RT 07 Resident Data Collection</h1>
        <p>Fill in the KK number, upload the KK document, and add family member records.</p>
      </header>

      <section className="form-card">
        <label>
          No KK
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={noKK}
            onChange={(event) => setNoKK(event.target.value)}
            placeholder="Enter KK number"
          />
        </label>

        <label>
          Upload KK file (PDF, Image)
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
          />
        </label>

        <div className="file-preview">
          <strong>Selected file:</strong> {kkFile?.name ?? 'None'}
        </div>
      </section>

      <section className="form-card">
        <button type="button" className="primary-button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit Response'}
        </button>
        {statusMessage ? <div className="status-message">{statusMessage}</div> : null}
      </section>

      <section className="form-card">
        <div className="table-header-row">
          <h2>Family Member List</h2>
          <button type="button" onClick={handleAddMember} className="primary-button">
            Add Member
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No KTP</th>
                <th>Name</th>
                <th>Birthday</th>
                <th>Status in family</th>
                <th>Marriage status</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {familyMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <input
                      type="text"
                      value={member.noKTP}
                      onChange={(event) => handleMemberChange(member.id, 'noKTP', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(event) => handleMemberChange(member.id, 'name', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={member.birthday}
                      onChange={(event) => handleMemberChange(member.id, 'birthday', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={member.statusInFamily}
                      onChange={(event) => handleMemberChange(member.id, 'statusInFamily', event.target.value)}
                      placeholder="e.g. Head/Child"
                    />
                  </td>
                  <td>
                    <select
                      value={member.marriageStatus}
                      onChange={(event) => handleMemberChange(member.id, 'marriageStatus', event.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={member.gender}
                      onChange={(event) => handleMemberChange(member.id, 'gender', event.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="danger-button" onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
