import { FC, useState, useEffect } from 'react';
import { styled } from '@emotion/styled';
import axios from 'axios';
import { useAuth } from '@utils/auth';

const FilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FileList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background: white;
`;

const FileItem = styled.div`
  padding: 5px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
`;

const UploadForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
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

const Files: FC = () => {
  const { user, token, selectedTeam } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedTeam) {
      fetchFiles();
    }
  }, [selectedTeam]);

  const fetchFiles = () => {
    axios.get(`http://localhost:5000/api/files/${selectedTeam}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      setFiles(response.data.data || []);
    });
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && selectedTeam) {
      const formData = new FormData();
      formData.append('file', file);
      axios.post(`http://localhost:5000/api/files/${selectedTeam}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }).then(() => {
        setFile(null);
        fetchFiles();
      });
    }
  };

  if (!selectedTeam) return <div>Select a team to manage files</div>;

  return (
    <FilesContainer>
      <UploadForm onSubmit={handleFileUpload}>
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button type="submit">Upload</Button>
      </UploadForm>
      <FileList>
        {files.map((file) => (
          <FileItem key={file._id}>
            <a href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
            <span>Uploaded by: {file.uploadedBy}</span>
          </FileItem>
        ))}
      </FileList>
    </FilesContainer>
  );
};

export default Files;