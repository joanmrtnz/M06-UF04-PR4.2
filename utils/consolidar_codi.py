import os
import sys
import argparse
import codecs
from datetime import datetime
from tqdm import tqdm

def count_files(parent_dir, included_extensions, all_excludes_in_path, excluded_files):
    count = 0
    for root, _, files in os.walk(parent_dir):
        if any(excl in root for excl in all_excludes_in_path):
            continue
        count += sum(1 for f in files 
                    if any(f.endswith(ext) for ext in included_extensions) 
                    and f not in excluded_files)
    return count

def consolidate_files(
    start_dir,
    output_dir,
    included_extensions=[], 
    excluded_paths=[],
    excluded_files=["package-lock.json"],
    prefix=None,
    excludes=None
):
    try:
        os.makedirs(output_dir, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        default_filename = f'consolidated_code_{timestamp}.txt'
        
        if prefix:
            default_filename = f'{prefix}_{default_filename}'

        output_file = os.path.join(output_dir, default_filename)

        all_excludes_in_path = set(excluded_paths)
        if excludes:
            all_excludes_in_path.update(excludes)

        print(f"Scanning directories from... {start_dir}")
        total_files = count_files(start_dir, included_extensions, all_excludes_in_path, excluded_files)
        
        if total_files == 0:
            print("No files found matching the specified criteria.")
            return

        print(f"Found {total_files} files to process")
        
        file_contents = []
        processed_files = 0
        files_by_extension = {}
        total_lines = 0
        
        with tqdm(total=total_files, desc="Processing files") as pbar:
            for root, dirs, files in os.walk(start_dir):
                if any(excl in root for excl in all_excludes_in_path):
                    continue

                for file in files:
                    if any(file.endswith(ext) for ext in included_extensions) and file not in excluded_files:
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, start_dir)

                        if any(excl in rel_path for excl in all_excludes_in_path):
                            continue

                        try:
                            with codecs.open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                lines = content.count('\n') + 1
                                total_lines += lines
                                
                                ext = os.path.splitext(file)[1]
                                files_by_extension[ext] = files_by_extension.get(ext, 0) + 1
                                
                                file_contents.append({
                                    'path': rel_path,
                                    'content': content,
                                    'lines': lines
                                })
                        except Exception as e:
                            print(f"\nError reading file {rel_path}: {str(e)}")
                        
                        pbar.update(1)
                        processed_files += 1

        print(f"\nWriting {processed_files} files to output...")
        try:
            with codecs.open(output_file, 'w', encoding='utf-8') as f:
                for file_data in tqdm(file_contents, desc="Writing output"):
                    f.write(f"### {file_data['path']}\n")
                    f.write(file_data['content'])
                    f.write('\n\n\n\n')
            
            print(f"\nConsolidation Summary:")
            print(f"----------------------")
            print(f"Total files processed: {processed_files}")
            print(f"Total lines of code: {total_lines}")
            print("\nFiles by extension:")
            for ext, count in sorted(files_by_extension.items()):
                print(f"  {ext}: {count} files")
            print("\nProcessed files:")
            for file_data in file_contents:
                print(f"  {file_data['path']} ({file_data['lines']} lines)")
            print(f"\nCreated consolidated file: {output_file}")
            
        except Exception as e:
            print(f"Error writing output file: {str(e)}")

    except Exception as e:
        print(f"Unexpected error in consolidate_files: {str(e)}")
        sys.exit(1)

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    parser = argparse.ArgumentParser(
        description='Consolidates project files into a single text file.',
        epilog='Example: python consolidate_code.py --dir /path/to/project --prefix=project_chat --excludes=test,temp'
    )
    
    parser.add_argument(
        '-d', '--dir',
        type=str,
        required=True,
        help='Starting directory for file processing'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        help='Output directory for consolidated file (default is "output" in script directory)'
    )
    
    parser.add_argument(
        '-p', '--prefix', 
        type=str, 
        help='Prefix for the output filename'
    )
    
    parser.add_argument(
        '-e', '--extensions', 
        nargs='+', 
        default=['.js', '.html', '.css', '.json', '.md'],
        help='File extensions to include'
    )
    
    parser.add_argument(
        '-x', '--exclude_paths', 
        nargs='+', 
        default=["node_modules", "coverage", "venv", ".git", "logs", "logs_test"],
        help='Directories to exclude'
    )

    parser.add_argument(
        '--excludes',
        type=str,
        help='Comma-separated list of additional terms to exclude from file paths'
    )

    parser.add_argument(
        '--exclude-files',
        type=str,
        help='Comma-separated list of exact filenames to exclude'
    )

    args = parser.parse_args()

    excludes_list = None
    if args.excludes:
        excludes_list = [term.strip() for term in args.excludes.split(',')]

    default_output = os.path.join(script_dir, 'output')
    output_dir = args.output if args.output else default_output
    
    consolidate_files(
        start_dir=args.dir,
        output_dir=output_dir,
        included_extensions=args.extensions, 
        excluded_paths=args.exclude_paths,
        prefix=args.prefix,
        excludes=excludes_list
    )

if __name__ == '__main__':
    main()