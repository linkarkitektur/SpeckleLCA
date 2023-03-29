# How To Contribute

_⚠️ This documemt is still a work in progress!_

Please drop in the the community. Either on GitHub Issues, Discussions and/or reach out to us directly so that we can align our efforts.

### Begin
* Start by cloning/forking the repo and swithcing the to `development` branch.
* From there you create your own feature branch if you are working in our repo and if you are in your own fork. Well you are the king of your own domain 👑.
* As soon as a feature feels ready to be share with everyone developing, just make a pull request to the development branch.

### Community
* Be nice to each other in the comment's and discussions.
* Own the responsibility for your commits and work - if you introduce a big feature, you're probably going to get some questions from time to time.

### Stability
Our aim is that the `main` branch is always a stable, working version that our app that is hosted on gh-pages is build from.

## Useful Tools to Get Started.
- [VSCode](https://code.visualstudio.com/)

## App Structure

The app is built with vue and uses a common framework for connecting with APIs and vueX with shared store with 3 primary modules for speckle, material mapper and results. This structure is not set in stone and if someone is more profficient in structuring these kinds of webbapps please contribute and help design it so it makes more sense for everyone.

![VueAppStructure](https://user-images.githubusercontent.com/81305859/228532437-2e16ef8e-0baa-42de-91c6-2161d815035f.jpg)

Each page is defined within its views and some uses components that populate each of the different parts of the page, below is a diagram showing the structure of the material mapper page which uses this structure. So if you want to change or add any functionallity its within these specified component below that you should make the changes in.

![MaterialMapper structure](https://user-images.githubusercontent.com/81305859/228532742-2c5221d5-f413-4f2b-adb4-3b6fed1e0fca.jpg)

## Useful Commands if You Prefer Working on the Command Line
 
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
 
