# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_dir = File.join(File.expand_path(File.dirname(__FILE__)), 'vagrant')

# @param swap_size_mb [Integer] swap size in megabytes
# @param swap_file [String] full path for swap file, default is /swapfile1
# @return [String] the script text for shell inline provisioning
def create_swap(swap_size_mb, swap_file = "/swapfile1")
  <<-EOS
    if [ ! -f #{swap_file} ]; then
      echo "Creating #{swap_size_mb}mb swap file=#{swap_file}. This could take a while..."
      dd if=/dev/zero of=#{swap_file} bs=1024 count=#{swap_size_mb * 1024}
      mkswap #{swap_file}
      chmod 0600 #{swap_file}
      swapon #{swap_file}
      if ! grep -Fxq "#{swap_file} swap swap defaults 0 0" /etc/fstab
      then
        echo "#{swap_file} swap swap defaults 0 0" >> /etc/fstab
      fi
    fi
  EOS
end

Vagrant.configure("2") do |config|

  # Store the current version of Vagrant for use in conditionals when dealing
  # with possible backward compatible issues.
  vagrant_version = Vagrant::VERSION.sub(/^v/, '')

  # Prefer VMware Fusion before VirtualBox
  config.vm.provider "virtualbox"
  config.vm.provider "vmware_fusion"

  # Configuration options for the VirtualBox provider.
  def configure_vbox_provider(config, name, ip, memory = 2048, cpus = 1)
    vagrant_dir = File.join(File.expand_path(File.dirname(__FILE__)), 'vagrant')

    config.vm.provider :virtualbox do |v, override| 
      # override box url
      override.vm.box = "ubuntu/xenial64"
      # configure host-only network
      override.vm.hostname = "#{name}.dev"
      override.vm.network :private_network, id: "vvv_primary", ip: ip

      v.customize ["modifyvm", :id, 
        "--memory", memory,
        "--cpus", cpus,
        "--name", name,
        "--natdnshostresolver1", "on",
        "--natdnsproxy1", "on"
      ]

      # Swap!
      override.vm.provision :shell, :inline => create_swap(1024)

      # Local Machine Hosts
      #
      # If the Vagrant plugin hostsupdater (https://github.com/cogitatio/vagrant-hostsupdater) is
      # installed, the following will automatically configure your local machine's hosts file to
      # be aware of the domains specified below. Watch the provisioning script as you may need to
      # enter a password for Vagrant to access your hosts file.
      #
      # By default, we'll include the domains set up by VVV through the vvv-hosts file
      # located in the www/ directory.
      #
      # Other domains can be automatically added by including a vvv-hosts file containing
      # individual domains separated by whitespace in subdirectories of www/.
      if defined?(VagrantPlugins::HostsUpdater)
        # Recursively fetch the paths to all vvv-hosts files under the www/ directory.
        paths = Dir[File.join(vagrant_dir, 'www', '**', 'vvv-hosts')]

        # Parse the found vvv-hosts files for host names.
        hosts = paths.map do |path|
          # Read line from file and remove line breaks
          lines = File.readlines(path).map(&:chomp)
          # Filter out comments starting with "#"
          lines.grep(/\A[^#]/)
        end.flatten.uniq # Remove duplicate entries

        # Pass the found host names to the hostsupdater plugin so it can perform magic.
        override.hostsupdater.aliases = hosts
        override.hostsupdater.remove_on_suspend = true
      end
    end
  end

  # Configuration options for the Parallels provider.
  def configure_parallels_provider(config, name, ip, memory = 2048, cpus = 1)
    config.vm.provider :parallels do |v, override| 
      # override box url
      override.vm.box = "parallels/ubuntu-16.04"
      # configure host-only network
      override.vm.hostname = "#{name}.dev"
      
      v.update_guest_tools = true
      v.optimize_power_consumption = false
      v.memory = memory
      v.cpus = cpus

      # Swap!
      override.vm.provision :shell, :inline => create_swap(1024)
    end
  end

  # Configuration options for the VMware Fusion provider.
  def configure_vmware_fusion_provider(config, name, ip, memory = 2048, cpus = 1)
    config.vm.provider :vmware_fusion do |v, override| 
      # override box url
      override.vm.box = "bento/ubuntu-16.04"
      # configure host-only network
      override.vm.hostname = "#{name}.dev"
      override.vm.network :private_network, id: "vvv_primary", ip: ip
      
      v.vmx["memsize"] = "{memory}"
      v.vmx["numvcpus"] = "{cpus}"

      # Swap!
      override.vm.provision :shell, :inline => create_swap(1024)
    end
  end

  # Configuration options for the VMware Workstation provider.
  def configure_vmware_workstation_provider(config, name, ip, memory = 2048, cpus = 1)
    config.vm.provider :vmware_workstation do |v, override| 
      # override box url
      override.vm.box = "bento/ubuntu-16.04"
      # configure host-only network
      override.vm.hostname = "#{name}.dev"
      
      v.vmx["memsize"] = "{memory}"
      v.vmx["numvcpus"] = "{cpus}"

      # Swap!
      override.vm.provision :shell, :inline => create_swap(1024)
    end
  end

  # Configuration options for Hyper-V provider.
  def configure_parallels_provider(config, name, ip, memory = 2048, cpus = 1)
    config.vm.provider :hyperv do |v, override| 
      # override box url
      override.vm.box = "kmm/ubuntu-xenial64"
      # configure host-only network
      override.vm.hostname = "#{name}.dev"
      override.vm.network :private_network, id: "vvv_primary", ip: nil
      
      v.memory = memory
      v.cpus = cpus

      # Swap!
      override.vm.provision :shell, :inline => create_swap(1024)
    end
  end
  
  # Configuration options for AWS provider.
  def configure_aws_provider(config)
    config.vm.provider :aws do |aws, override|
      # use dummy box
      override.vm.box = "aws_dummy_box"
      override.vm.box_url = "https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box"
      # override ssh user and private key
      override.ssh.username = "ubuntu"
      override.ssh.private_key_path = "#{ENV['HOME']}/.ssh/mccloud_rsa"

      # aws specific settings
      aws.access_key_id = "XXXX"
      aws.secret_access_key = "XXXXX"
      aws.ami = "ami-524e4726"
      aws.region = "eu-west-1"
      aws.availability_zone = "eu-west-1c"
      aws.instance_type = "m1.small"
      aws.security_groups = [ "mccloud", "http" ]
      aws.keypair_name = "mccloud-key-tlc"
    end
  end

  # Configuration options for Managed Server provider.
  def configure_managed_provider(config, server)
    config.vm.provider :managed do |managed, override|
      # use dummy box
      override.vm.box = "managed_dummy_box"
      override.vm.box_url = "https://github.com/tknerr/vagrant-managed-servers/raw/master/dummy.box"

      # link with this server
      managed.server = server
    end
  end

  # SSH Agent Forwarding
  #
  # Enable agent forwarding on vagrant ssh commands. This allows you to use ssh keys
  # on your host machine inside the guest. See the manual for `ssh-add`.
  config.ssh.forward_agent = true

  #
  # define a separate VMs for the 3 providers (vbox, aws, managed) 
  # because with Vagrant 1.2.2 you can run a VM with only one provider at once
  #
  default_provider = "virtualbox"
  supported_providers = %w(virtualbox rackspace aws managed)
  active_provider = ENV['VAGRANT_ACTIVE_PROVIDER'] # it'd be better to get this from the CLI --provider option
  supported_providers.each do |provider|
    next unless (active_provider.nil? && provider == default_provider) || active_provider == provider

    #
    # VM per provider
    #
    config.vm.define :"shinobi-web-#{provider}" do | shinobi_web_config |

      case provider
      when "virtualbox"
        configure_vbox_provider(shinobi_web_config, "shinobi", "192.168.50.100")

      when "aws"
        configure_aws_provider(shinobi_web_config)

      when "rackspace"
        configure_rackspace_provider(shinobi_web_config, "web1.shinobi.com")  

      when "managed"
        configure_managed_provider(shinobi_web_config, "web1.shinobi.com")  
        
      end
      
      # /srv/www/
      # /home/shinobi/
      #
      # If a www directory exists in the same directory as your Vagrantfile, a mapped directory
      # inside the VM will be created that acts as the default location for nginx sites. Put all
      # of your project files here that you want to access through the web server
      if vagrant_version >= "1.3.0"
        shinobi_web_config.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=664" ]
        shinobi_web_config.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=664" ]
      else
        shinobi_web_config.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :extra => 'dmode=775,fmode=664'
        shinobi_web_config.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :extra => 'dmode=775,fmode=664'
      end

      shinobi_web_config.vm.provision "fix-no-tty", type: "shell" do |s|
        s.privileged = false
        s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
      end

    end
  end

  # Public Network (disabled)
  #
  # Using a public network rather than the default private network configuration will allow
  # access to the guest machine from other devices on the network. By default, enabling this
  # line will cause the guest machine to use DHCP to determine its IP address. You will also
  # be prompted to choose a network interface to bridge with during `vagrant up`.
  #
  # Please see VVV and Vagrant documentation for additional details.
  #
  # config.vm.network :public_network

  # Port Forwarding (disabled)
  #
  # This network configuration works alongside any other network configuration in Vagrantfile
  # and forwards any requests to port 8080 on the local host machine to port 80 in the guest.
  #
  # Port forwarding is a first step to allowing access to outside networks, though additional
  # configuration will likely be necessary on our host machine or router so that outside
  # requests will be forwarded from 80 -> 8080 -> 80.
  #
  # Please see VVV and Vagrant documentation for additional details.
  #
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Drive mapping
  #
  # The following config.vm.synced_folder settings will map directories in your Vagrant
  # virtual machine to directories on your local machine. Once these are mapped, any
  # changes made to the files in these directories will affect both the local and virtual
  # machine versions. Think of it as two different ways to access the same file. When the
  # virtual machine is destroyed with `vagrant destroy`, your files will remain in your local
  # environment.

  # /srv/database/
  #
  # If a database directory exists in the same directory as your Vagrantfile,
  # a mapped directory inside the VM will be created that contains these files.
  # This directory is used to maintain default database scripts as well as backed
  # up mysql dumps (SQL files) that are to be imported automatically on vagrant up
  config.vm.synced_folder File.join(vagrant_dir, "database/"), "/srv/database"

  # If the mysql_upgrade_info file from a previous persistent database mapping is detected,
  # we'll continue to map that directory as /var/lib/mysql inside the virtual machine. Once
  # this file is changed or removed, this mapping will no longer occur. A db_backup command
  # is now available inside the virtual machines hine to backup all databases for future use. This
  # command is automatically issued on halt, suspend, and destroy if the vagrant-triggers
  # plugin is installed.
  if File.exists?(File.join(vagrant_dir,'database/data/mysql_upgrade_info')) then
    if vagrant_version >= "1.3.0"
      config.vm.synced_folder File.join(vagrant_dir, "database/data/"), "/var/lib/mysql", :mount_options => [ "dmode=777", "fmode=777" ]
    else
      config.vm.synced_folder File.join(vagrant_dir, "database/data/"), "/var/lib/mysql", :extra => 'dmode=777,fmode=777'
    end

    # The Parallels Provider does not understand "dmode"/"fmode" in the "mount_options" as
    # those are specific to Virtualbox. The folder is therefore overridden with one that
    # uses corresponding Parallels mount options.
    config.vm.provider :parallels do |v, override|
      override.vm.synced_folder File.join(vagrant_dir, "database/data/"), "/var/lib/mysql", :mount_options => []
    end
  end

  # /srv/config/
  #
  # If a server-conf directory exists in the same directory as your Vagrantfile,
  # a mapped directory inside the VM will be created that contains these files.
  # This directory is currently used to maintain various config files for php and
  # nginx as well as any pre-existing database files.
  config.vm.synced_folder File.join(vagrant_dir, "config/"), "/srv/config"

  # /srv/log/
  #
  # If a log directory exists in the same directory as your Vagrantfile, a mapped
  # directory inside the VM will be created for some generated log files.
  config.vm.synced_folder File.join(vagrant_dir, "log/"), "/srv/log", :owner => "www-data"

  # /srv/www/
  # /home/shinobi/
  #
  # If a www directory exists in the same directory as your Vagrantfile, a mapped directory
  # inside the VM will be created that acts as the default location for nginx sites. Put all
  # of your project files here that you want to access through the web server
  if vagrant_version >= "1.3.0"
    config.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=664" ]
    config.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :mount_options => [ "dmode=775", "fmode=664" ]
  else
    config.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :extra => 'dmode=775,fmode=664'
    config.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :extra => 'dmode=775,fmode=664'
  end

  config.vm.provision "fix-no-tty", type: "shell" do |s|
    s.privileged = false
    s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
  end

  # The Parallels Provider does not understand "dmode"/"fmode" in the "mount_options" as
  # those are specific to Virtualbox. The folder is therefore overridden with one that
  # uses corresponding Parallels mount options.
  config.vm.provider :parallels do |v, override|
    override.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :mount_options => []
    override.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :mount_options => []
  end

  # The Hyper-V Provider does not understand "dmode"/"fmode" in the "mount_options" as
  # those are specific to Virtualbox. Furthermore, the normal shared folders need to be
  # replaced with SMB shares. Here we switch all the shared folders to us SMB and then
  # override the www folder with options that make it Hyper-V compatible.
  config.vm.provider :hyperv do |v, override|
    override.vm.synced_folder File.join(vagrant_dir, "www/"), "/srv/www/", :owner => "www-data", :mount_options => ["dir_mode=0775","file_mode=0774","forceuid","noperm","nobrl","mfsymlinks"]
    override.vm.synced_folder File.expand_path(File.dirname(__FILE__)), "/home/shinobi/", :owner => "www-data", :mount_options => ["dir_mode=0775","file_mode=0664","forceuid","noperm","nobrl","mfsymlinks"]
    # Change all the folder to use SMB instead of Virtual Box shares
    override.vm.synced_folders.each do |id, options|
      if ! options[:type]
        options[:type] = "smb"
      end
    end
  end

  # Customfile - POSSIBLY UNSTABLE
  #
  # Use this to insert your own (and possibly rewrite) Vagrant config lines. Helpful
  # for mapping additional drives. If a file 'Customfile' exists in the same directory
  # as this Vagrantfile, it will be evaluated as ruby inline as it loads.
  #
  # Note that if you find yourself using a Customfile for anything crazy or specifying
  # different provisioning, then you may want to consider a new Vagrantfile entirely.
  if File.exists?(File.join(vagrant_dir,'Customfile')) then
    eval(IO.read(File.join(vagrant_dir,'Customfile')), binding)
  end

  # Provisioning
  #
  # Process one or more provisioning scripts depending on the existence of custom files.
  #
  # provison-pre.sh acts as a pre-hook to our default provisioning script. Anything that
  # should run before the shell commands laid out in provision.sh (or your provision-custom.sh
  # file) should go in this script. If it does not exist, no extra provisioning will run.
  if File.exists?(File.join(vagrant_dir,'provision','provision-pre.sh')) then
    config.vm.provision :shell, :path => File.join( "provision", "provision-pre.sh" )
  end

  # provision.sh or provision-custom.sh
  #
  # By default, Vagrantfile is set to use the provision.sh bash script located in the
  # provision directory. If it is detected that a provision-custom.sh script has been
  # created, that is run as a replacement. This is an opportunity to replace the entirety
  # of the provisioning provided by default.
  if File.exists?(File.join(vagrant_dir,'provision','provision-custom.sh')) then
    config.vm.provision :shell, :path => File.join(vagrant_dir, "provision", "provision-custom.sh" )
  else
    config.vm.provision :shell, :path => File.join(vagrant_dir, "provision", "provision.sh" )
  end

  # provision-post.sh acts as a post-hook to the default provisioning. Anything that should
  # run after the shell commands laid out in provision.sh or provision-custom.sh should be
  # put into this file. This provides a good opportunity to install additional packages
  # without having to replace the entire default provisioning script.
  if File.exists?(File.join(vagrant_dir,'provision','provision-post.sh')) then
    config.vm.provision :shell, :path => File.join( "provision", "provision-post.sh" )
  end

  # Always start MySQL on boot, even when not running the full provisioner
  # (run: "always" support added in 1.6.0)
  if vagrant_version >= "1.6.0"
    config.vm.provision :shell, inline: "sudo service mysql restart", run: "always"
    config.vm.provision :shell, inline: "sudo service mongodb restart", run: "always"
    config.vm.provision :shell, inline: "sudo service apache2 restart", run: "always"
  end

  # Vagrant Triggers
  #
  # If the vagrant-triggers plugin is installed, we can run various scripts on Vagrant
  # state changes like `vagrant up`, `vagrant halt`, `vagrant suspend`, and `vagrant destroy`
  #
  # These scripts are run on the host machine, so we use `vagrant ssh` to tunnel back
  # into the VM and execute things. By default, each of these scripts calls db_backup
  # to create backups of all current databases. This can be overridden with custom
  # scripting. See the individual files in config/homebin/ for details.
  if defined? VagrantPlugins::Triggers
    config.trigger.before :halt, :stdout => true do
      run "vagrant ssh -c 'vagrant_halt'"
    end
    config.trigger.before :suspend, :stdout => true do
      run "vagrant ssh -c 'vagrant_suspend'"
    end
    config.trigger.before :destroy, :stdout => true do
      run "vagrant ssh -c 'vagrant_destroy'"
    end
  end

end
