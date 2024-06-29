import React, { useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, TreeItemProps } from '@mui/x-tree-view/TreeItem';
import Typography from '@mui/material/Typography';
import DescriptionIcon from '@mui/icons-material/Description';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import FolderIcon from '@mui/icons-material/Folder';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { FileIndex } from '../../models';

interface StyledTreeItemProps extends TreeItemProps {
  labelIcon: React.ElementType<SvgIconProps>;
  labelText: string;
}

const StyledTreeItem = (props: StyledTreeItemProps) => {
  const { labelText, labelIcon: LabelIcon, color, ...other } = props;
  const theme: Theme = useTheme();

  const labelRootStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  };
  const labelIconStyle = {
    marginRight: theme.spacing(1),
  };
  const labelTextStyle = {
    fontWeight: 'inherit',
    flexGrow: 1,
  };

  return (
    <TreeItem
      label={
        <div style={labelRootStyle}>
          <LabelIcon color="inherit" sx={labelIconStyle} fontSize="small" />
          <Typography variant="body2" sx={labelTextStyle}>
            {labelText}
          </Typography>
        </div>
      }
      {...other}
    />
  );
}

export interface FileTreeMultiViewProps {
  files: FileIndex[];
  rootPath: string;
  select: (fileNames: string[]) => void;
  defaultExpandedFolder?: string[];
}

const FileTreeMultiView = (props: FileTreeMultiViewProps) => {
  const { files, rootPath, select, defaultExpandedFolder } = props;

  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: string[]) => {
    setSelectedItems(ids);
    const fileNameLists: string[] = [];
    files.forEach((element) => {
      if (ids.includes(element.id)) {
        fileNameLists.push(element.name);
      }
    });
    select(fileNameLists);
  };

  const convertedRootPath = rootPath.replaceAll("\\", "/");

  interface TreeNode {
    [key: string]: TreeNode | FileIndex;
  }

  const tree: TreeNode = {};
  files.forEach((file: FileIndex) => {
    let currentNode = tree;
    const convertedFilePath = file.filePath.replace(/\\/g, '/');
    const filePath = convertedFilePath.replace(convertedRootPath, '');
    filePath.split('/').forEach((segment) => {
      if (currentNode[segment] === undefined) {
        if (segment.includes('.ops')) {
          currentNode[file.name] = file;
        } else {
          currentNode[segment] = {};
        }
      }
      currentNode = currentNode[segment] as TreeNode;
    });
  });

  const toTreeData = (tree: TreeNode) => {
    return Object.keys(tree).map((label) => {
      const node = tree[label];
      const o: { label: string; file?: FileIndex; children?: ReturnType<typeof toTreeData> } = { label };
      if ('id' in node) {
        o.file = node as FileIndex;
      } else if (Object.keys(node).length > 0) {
        o.children = toTreeData(node);
      }
      return o;
    });
  };

  const showTreeItem = (data: ReturnType<typeof toTreeData>) => {
    return data.length > 0 && data.map((child) => {
      const label = child.label;
      if (child.file) {
        const Icon = selectedItems.includes(child.file.id) ? DescriptionIcon : DescriptionTwoToneIcon;
        return (
          <StyledTreeItem
            key={label}
            itemId={child.file.id}
            labelText={label}
            labelIcon={Icon}
          />
        );
      } else {
        return (
          <StyledTreeItem
            key={label}
            itemId={`folder--${label}`}
            labelText={label}
            labelIcon={FolderIcon}
          >
            {showTreeItem(child.children || [])}
          </StyledTreeItem>
        );
      }
    });
  };

  return (
    <SimpleTreeView
      multiSelect
      selectedItems={selectedItems}
      onSelectedItemsChange={handleSelectedItemsChange}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400 }}
    >
      {showTreeItem(toTreeData(tree))}
    </SimpleTreeView>
  );
};

export default FileTreeMultiView;
