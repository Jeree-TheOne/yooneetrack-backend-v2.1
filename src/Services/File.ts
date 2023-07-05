import { db } from "../Utils/db"

/** Service for work with Files */

class FileService {
  
  /**
   * Method to upload multiple files to the database
   * @param {string[]} paths files paths
   * @returns {string[]} files ids
   */
  async upload(paths: string[]): Promise<string[]> {
    const files = await Promise.all(paths.map(path => this.uploadSingle(path)))
    return files
  }

  /**
   * Method to upload a single file to the database
   * @param {string} path 
   * @returns {string} file id
   */
  async uploadSingle(path: string): Promise<string> {
    const file = await db.file.create({
      data: { path: path.replace('storage/', '') }
    })
    return file.id
  }

  /**
   * Method to delete a file from the database
   * @param {string} path file path 
   */
  async delete(path: string): Promise<void> {
    await db.file.delete({ where: { path }})
  }

  /**
   * Method to receive files paths by their id
   * @param {string[]} filesId 
   * @returns {string[]} files paths
   */
  async selectFiles(filesId: string[]): Promise<string[]> {
    if (!filesId.length) return []
    const files = await db.file.findMany({
      where: { id: { in: filesId } }
    })
    return files.map(file => file.path)
  }
}

export default new FileService()