# How to contribute

_This documet is still a work in progress_

Please drop in the the comunity. Either on GitHub Issues, Disscussions and/or reach out to us directly so that we can align our efforts.

Then start by cloning/forking the repo and swithcing the to `development` branch. From there you create your own feauter branch if you are working in our repo 
and if you are in your own fork. Well you are the king of your own domain 👑.
As soon as a feautre feels ready to be share with everyone developing, just make a pull request to the development branch.

Our aim in stat the `main` branch always is a stable working version that our app that is hosted on gh-pages is build from.

## Useful tools to get started.
- [VSCode](https://code.visualstudio.com/)


## Useful commands if you prefer working on the command line
 
__Clone a repository__
```bash 
git clone `# URL`
git clone git@github.com:linkarkitektur/SpeckleLCA.git
```
__Switch and create a new branch__
```bash
git checkout `# branch name`
git checkout development

git branch `# Name of new branch`
git branch adding_mapper

git checkout adding_mapper
```

_Do development_

__Add specific files to commit__
```bash
git add `# Path to file` `# Optional path to another file` `# and so on` 
git add ./fist_file ./dir/second_file

# Add all changed files to commit
git add . 

```
__Make a commit message__
```bash
git commit -m "Commit message"
```

__Push that commit to the origin e.g. GitHub__
```bash
git push
```

__Other useful commands__
```bash
# Pull changes
git pull

# Pull changes form another branch
git pull origin development

 
# Fetch the changes form GitHub. 
# Same as pull, but is does not apply them to your current directory.
# You just have them in you local copy of the repository
git fetch

# Show the status of your repository
# e.g. changed files
# files added to commits etc.
git status
```
 
