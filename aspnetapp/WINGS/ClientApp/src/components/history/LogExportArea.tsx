import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import GetAppIcon from '@mui/icons-material/GetApp';
import TransferList from '../common/TransferList';
import { saveAs } from 'file-saver';

const extractFileName = (contentDispositionValue: string) => {
  let filename = "";
  if (contentDispositionValue && contentDispositionValue.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDispositionValue);
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
    try {
      const response = await fetch(`/api/operations/${opid}/history/tlm_packets`, {
        method: 'GET'
      });
      const json = await response.json() as { data: string[], message: string };
      const data = json.data;
      setPackets(data);
    } catch (error) {
      console.error("Failed to fetch telemetry packets:", error);
    }
  };

  const fetchTlmPacketsWrapper = () => {
    fetchTlmPackets().catch((error) => {
      console.error("Failed to fetch telemetry packets:", error);
    });
  };

  const fetchRecordTlmPackets = async () => {
    try {
      const response = await fetch(`/api/operations/${opid}/history/record_tlm_packets`, {
        method: 'GET'
      });
      const json = await response.json() as { data: string[], message: string };
      const data: string[] = json.data;
      setRecordPackets(data);
    } catch (error) {
      console.error("Failed to fetch record telemetry packets:", error);
    }
  };

  const fetchRecordTlmPacketsWrapper = () => {
    fetchRecordTlmPackets().catch((error) => {
      console.error("Failed to fetch record telemetry packets:", error);
    });
  };

  const downloadCommandLog = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      },
      responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/cmd_logs`, options);
    const contentDisposition = response.headers.get("content-disposition") as string;
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadCommandLogClick = () => {
    downloadCommandLog().catch((error) => {
      console.error("Failed to download command log:", error);
    });
  };

  const downloadCommandFileLog = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      },
      responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/cmdfile_logs`, options);
    const contentDisposition = response.headers.get("content-disposition") as string;
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadCommandFileLogClick = () => {
    downloadCommandFileLog().catch((error) => {
      console.error("Failed to download command file log:", error);
    });
  };

  const downloadTelemetryLog = async () => {
    const packetNames = selectedPackets.join();
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/zip'
      },
      responseType: 'blob'
    };
    const response = await fetch(`/api/operations/${opid}/history/tlm_logs?packet_name=${packetNames}`, options);
    const contentDisposition = response.headers.get("content-disposition") as string;
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadTelemetryLogClick = () => {
    downloadTelemetryLog().catch((error) => {
      console.error("Failed to download telemetry log:", error);
    });
  };

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
    const contentDisposition = response.headers.get("content-disposition") as string;
    const fileName = extractFileName(contentDisposition);
    const blob = await response.blob();
    saveAs(blob, fileName);
  };

  const downloadRecordTelemetryLogClick = () => {
    downloadRecordTelemetryLog().catch((error) => {
      console.error("Failed to download record telemetry log:", error);
    });
  };


  useEffect(() => {
    fetchTlmPacketsWrapper();
  }, [])
  useEffect(() => {
    fetchRecordTlmPacketsWrapper();
  }, [])

  return (
    <>
      <h2 className="u-text__headline">Export</h2>
      <div className="p-content-nect-headline">
        <div>
          <IconButton onClick={downloadCommandLogClick}>
            <GetAppIcon />
          </IconButton>
          Command Logs
        </div>
        <div>
          <IconButton onClick={downloadCommandFileLogClick}>
            <GetAppIcon />
          </IconButton>
          Command File Logs
        </div>
        <div>
          <IconButton onClick={downloadTelemetryLogClick}>
            <GetAppIcon />
          </IconButton>
          Telemetry Logs
        </div>
        <div className="module-spacer--extra-extra-small" />
        <TransferList data={packets} setSelected={setSelectedPackets} />
        <div className="module-spacer--extra-extra-small" />
        <div>
          <IconButton onClick={downloadRecordTelemetryLogClick}>
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
