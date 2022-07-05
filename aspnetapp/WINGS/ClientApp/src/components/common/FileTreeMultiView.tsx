import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import DescriptionIcon from '@material-ui/icons/Description';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';
import FolderIcon from '@material-ui/icons/Folder';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { FileIndex } from '../../models';

const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      color: theme.palette.text.secondary,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    selected: {},
    label: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

interface StyledTreeItemProps extends TreeItemProps {
  labelIcon: React.ElementType<SvgIconProps>;
  labelText: string;
}

const StyledTreeItem = (props: StyledTreeItemProps) => {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, color,  ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} fontSize="small"/>
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
        </div>
      }
      classes={{
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export interface FileTreeMultiViewProps {
  files: FileIndex[],
  rootPath: string,
  select: any,
  defaultExpandedFolder?: string[]
}

const FileTreeMultiView = (props: FileTreeMultiViewProps) => {
  const classes = useStyles();
  const { files, rootPath, select, defaultExpandedFolder } = props

  interface CheckedState {
    [id: string] : boolean;
  }

  let initCheckedState : CheckedState = {};
  files.forEach(element => initCheckedState[element.name] = false);
  const [checkedState, setCheckedState] = useState(initCheckedState);

  const handleSelect = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    let changeCheckedState = {...checkedState};
    if (nodeIds.includes("folder--")) {
      files.forEach(element => {
        changeCheckedState[element.name] = false;
      })
    }
    else {
      select(nodeIds);
      files.forEach(element => {
        if (nodeIds.indexOf(element.id) >= 0) {
          changeCheckedState[element.name] = true;
        }
        else{
          changeCheckedState[element.name] = false;
        }
      })
    }
    setCheckedState(changeCheckedState);
  };

  var tree: any = {};
  files.forEach((file: FileIndex) => {
    var currentNode = tree;
    const filePath = file.filePath.replace(rootPath, "");
    filePath.split('/').forEach((segment: string) => {
      if (currentNode[segment] === undefined) {
        if (segment.includes(".ops")) {
          currentNode[file.name] = file
        } else {
          currentNode[segment] = {};
        }
      }
      currentNode = currentNode[segment];
    })
  });

  const toTreeData = (tree: any) => {
    return Object.keys(tree).map((label: any) => {
      var o: any = { label: label };
      if ('id' in tree[label]) {
        o.file = tree[label];
      } else if (Object.keys(tree[label]).length > 0) {
        o.children = toTreeData(tree[label]);
      }
      return o;
    })
  };

  const showTreeItem = (data: any) => {
    if (data) {
      return (
        data.length > 0 && data.map((child: any) => {
          const label = child.label;
          if ('file' in child) {
              if (checkedState[child.label] === true){
                return <StyledTreeItem key={label} nodeId={child.file.id} labelText={label} labelIcon={DescriptionIcon} />
              }
              else{
                return <StyledTreeItem key={label} nodeId={child.file.id} labelText={label} labelIcon={DescriptionTwoToneIcon} />
              }
          } else {
            return (
              <StyledTreeItem key={label} nodeId={`folder--${label}`} labelText={label} labelIcon={FolderIcon}>
                {showTreeItem(child.children)}
              </StyledTreeItem>
            )
          }
        })
      )
    }
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultExpanded={defaultExpandedFolder && defaultExpandedFolder.map(name => "folder--"+name)}
      defaultEndIcon={<div style={{ width: 24 }} />}
      //selected={selected}
      multiSelect={true}
      onNodeSelect={handleSelect}
    >
      {showTreeItem(toTreeData(tree))}
    </TreeView>
  )
};

export default FileTreeMultiView;
