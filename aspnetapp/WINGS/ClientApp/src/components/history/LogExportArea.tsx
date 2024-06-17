import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import GetAppIcon from '@mui/icons-material/GetApp';
import TransferList from '../common/TransferList';
import { saveAs } from 'file-saver';

const extractFileName = (contentDispositionValue: any) => {
  var filename = "";
  if (contentDispositionValue && contentDispositionValue.indexOf('attachment') !== -1) {
    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    var matches = filenameRegex.exec(contentDispositionValue);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  return filename;
}

export interface LogExportAreaProps {
  opid: string
}

const LogExportArea = (props: LogExportAreaProps) => {
  const { opid } = props;
  const [packets, setPackets] = useState<string[]>([]);
  const [selectedPackets, setSelectedPackets] = useState<string[]>([]);
  const [recordPackets, setRecordPackets] = useState<string[]>([]);
  const [selectedRecordPackets, setSelectedRecordPackets] = useState<string[]>([]);

  const fetchTlmPackets = async () => {
    const response = await fetch(`/api/operations/${opid}/history/tlm_packets`, {
      method: 'GET'
    });
    const json = await response.json();
    const data: string[] = json.data;
    setPackets(data);
  }
  const fetchRecordTlmPackets = async () => {
    const response = await fetch(`/api/operations/${opid}/history/record_tlm_packets`, {
      method: 'GET'
    });
    const json = await response.json();
    const data: string[] = json.data;
    setRecordPackets(data);
  }

  const downloadCommandLog = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      },
      responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/cmd_logs`, options);
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadCommandFileLog = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      }, responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/cmdfile_logs`, options);
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadTelemetryLog = async () => {
    const packetNames = selectedPackets.join();
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/zip'
      }, responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/tlm_logs?packet_name=${packetNames}`, options);
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  }

  const downloadRecordTelemetryLog = async () => {
    const packetNames = selectedRecordPackets.join();
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/zip'
      },
      responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/record_tlm_logs?packet_name=${packetNames}`, options);
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  }

  useEffect(() => {
    fetchTlmPackets();
  }, [])
  useEffect(() => {
    fetchRecordTlmPackets();
  }, [])

  return (
    <>
      <h2 className="u-text__headline">Export</h2>
      <div className="p-content-nect-headline">
        <div>
          <IconButton onClick={downloadCommandLog}>
            <GetAppIcon />
          </IconButton>
          Command Logs
        </div>
        <div>
          <IconButton onClick={downloadCommandFileLog}>
            <GetAppIcon />
          </IconButton>
          Command File Logs
        </div>
        <div>
          <IconButton onClick={downloadTelemetryLog}>
            <GetAppIcon />
          </IconButton>
          Telemetry Logs
        </div>
        <div className="module-spacer--extra-extra-small" />
        <TransferList data={packets} setSelected={setSelectedPackets} />
        <div className="module-spacer--extra-extra-small" />
        <div>
          <IconButton onClick={downloadRecordTelemetryLog}>
            <GetAppIcon />
          </IconButton>
          DR Telemetry Logs
        </div>
        <div className="module-spacer--extra-extra-small" />
        <TransferList data={recordPackets} setSelected={setSelectedRecordPackets} />
      </div>
    </>
  )
};

export default LogExportArea;
