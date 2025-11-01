import React, { useState } from 'react';
import { Dailog as Dialog, TextField } from '@ethos-frontend/ui';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

export default function RejectDialog({ open, onClose, onConfirm }: Props) {
  const [comment, setComment] = useState('');

  const handleConfirm = () => {
    onConfirm(comment);
    setComment('');
  };

  return (
    <Dialog
      open={open}
      onCancel={() => {
        setComment('');
        onClose();
      }}
      onConfirm={handleConfirm}
      title="Reject Comment"
      confirmText="Save"
      cancelText="Cancel"
      size="md"
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Comment"
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Dialog>
  );
}
